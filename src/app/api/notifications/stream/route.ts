import {NextResponse} from "next/server"
import posthog from "posthog-js"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const routePath = "/api/notifications/stream"

export async function GET(req: Request) {
    let userId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId")

        if (!userId) {
            return new Response(JSON.stringify({ error: "userId is required as a query parameter" }), { status: 400, headers: { "Content-Type": "application/json" } })
        }

        const channel = `notifications:live:${userId}`
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/subscribe/${encodeURIComponent(channel)}`

        const upstream = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                Accept: "text/event-stream",
                "Cache-Control": "no-cache",
            }
        })

        if (!upstream.ok || !upstream.body) {
            return new Response("Upstream subscribe failed", { status: 502 })
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            }
        })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId })
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
}