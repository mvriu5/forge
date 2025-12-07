import {NextRequest, NextResponse} from "next/server"
import { auth } from "./lib/auth"
import { headers } from "next/headers"

const authRoutes = ["/signin", "/signup"]
const passwordRoutes = ["/reset", "/forgot"]
const landingRoutes = ["/", "/privacy", "/terms", "/imprint", "/sitemap.xml"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith("/ph/")) {
        const url = request.nextUrl.clone()
        const hostname = pathname.startsWith("/ph/static/")
            ? "eu-assets.i.posthog.com"
            : "eu.i.posthog.com"

        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("host", hostname)

        url.protocol = "https"
        url.hostname = hostname
        url.port = "443"
        url.pathname = url.pathname.replace(/^\/ph/, "")

        return NextResponse.rewrite(url, { headers: requestHeaders })
    }

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const isAuthRoute = authRoutes.includes(pathname)
    const isPasswordRoute = passwordRoutes.includes(pathname)
    const isLanding = landingRoutes.includes(pathname)

    const referer = request.headers.get("referer") ?? ""
    const cameFromDashboard = referer.includes("/dashboard")

    if (session && isLanding && !cameFromDashboard) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
    }

    if (!session) {
        if (isAuthRoute || isPasswordRoute || isLanding) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (session && (isAuthRoute || isPasswordRoute)) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/ph/:path*',
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ]
}