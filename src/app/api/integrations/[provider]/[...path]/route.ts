import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { apiError } from "@/lib/api-response"
import { getIntegrationAccessToken } from "@/lib/integration-token"

type Provider = "github" | "google"

const upstreamOrigins: Record<Provider, string> = {
    github: "https://api.github.com",
    google: "https://www.googleapis.com",
}

const isAllowedRequest = (provider: Provider, method: string, path: string): boolean => {
    if (provider === "github") {
        if (method === "POST") return path === "graphql"
        if (method !== "GET") return false
        return (
            path === "user" || path === "user/repos" || path === "user/orgs" || /^orgs\/[^/]+\/repos$/.test(path) || /^repos\/[^/]+\/[^/]+\/issues$/.test(path)
        )
    }

    if (method === "POST") {
        return /^calendar\/v3\/calendars\/[^/]+\/events$/.test(path)
    }
    if (method !== "GET") return false
    return (
        path === "calendar/v3/users/me/calendarList" ||
        path === "gmail/v1/users/me/labels" ||
        path === "gmail/v1/users/me/messages" ||
        /^gmail\/v1\/users\/me\/messages\/[^/]+$/.test(path) ||
        /^calendar\/v3\/calendars\/[^/]+\/events$/.test(path) ||
        /^calendar\/v3\/calendars\/[^/]+\/events\/[^/]+\/instances$/.test(path)
    )
}

async function proxyIntegrationRequest(request: Request, { params }: { params: Promise<{ provider: string; path: string[] }> }) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return apiError(401, "UNAUTHORIZED", "Authentication required.")

    const { provider: rawProvider, path: pathSegments } = await params
    if (rawProvider !== "github" && rawProvider !== "google") {
        return apiError(404, "NOT_FOUND", "Unsupported integration.")
    }

    const provider: Provider = rawProvider
    const path = pathSegments.join("/")
    if (!isAllowedRequest(provider, request.method, path)) {
        return apiError(403, "FORBIDDEN", "Integration operation is not allowed.")
    }

    const accessToken = await getIntegrationAccessToken(provider, session.user.id, await headers())
    if (!accessToken) {
        return apiError(401, "UNAUTHORIZED", "Integration is not connected.")
    }

    const incomingUrl = new URL(request.url)
    const upstreamUrl = new URL(path, `${upstreamOrigins[provider]}/`)
    upstreamUrl.search = incomingUrl.search

    const requestHeaders = new Headers({
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
    })
    const contentType = request.headers.get("content-type")
    if (contentType) requestHeaders.set("Content-Type", contentType)
    if (provider === "github") {
        requestHeaders.set("X-GitHub-Api-Version", "2022-11-28")
        requestHeaders.set("User-Agent", "Forge")
    }

    const response = await fetch(upstreamUrl, {
        method: request.method,
        headers: requestHeaders,
        body: request.method === "GET" ? undefined : await request.arrayBuffer(),
        cache: "no-store",
    })

    const responseHeaders = new Headers()
    const responseContentType = response.headers.get("content-type")
    if (responseContentType) responseHeaders.set("Content-Type", responseContentType)

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
    })
}

export const GET = proxyIntegrationRequest
export const POST = proxyIntegrationRequest
