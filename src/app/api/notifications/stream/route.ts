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

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const reader = upstream.body.getReader()
        let buffer = ""

        const stream = new ReadableStream({
            async pull(controller) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        if (buffer.length > 0) controller.enqueue(encoder.encode(buffer))
                        controller.close()
                        return
                    }

                    buffer += decoder.decode(value, { stream: true })

                    let boundary = buffer.indexOf("\n\n")
                    while (boundary !== -1) {
                        const rawEvent = buffer.slice(0, boundary)
                        buffer = buffer.slice(boundary + 2)

                        const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data:"))
                        if (!dataLine) {
                            boundary = buffer.indexOf("\n\n")
                            continue
                        }

                        const rawData = dataLine.slice("data:".length).trim()
                        if (!rawData) {
                            boundary = buffer.indexOf("\n\n")
                            continue
                        }

                        let jsonPayload: string | null = null

                        if (rawData.startsWith("message,")) {
                            const [, , ...rest] = rawData.split(",")
                            const payload = rest.join(",").trim()

                            if (payload.startsWith("subscribe")) {
                                boundary = buffer.indexOf("\n\n")
                                continue
                            }

                            if (payload.startsWith("{")) {
                                jsonPayload = payload
                            } else {
                                console.error("Upstash notification missing JSON payload", rawData)
                                boundary = buffer.indexOf("\n\n")
                                continue
                            }
                        } else if (rawData.startsWith("{")) {
                            jsonPayload = rawData
                        }

                        if (!jsonPayload) {
                            boundary = buffer.indexOf("\n\n")
                            continue
                        }

                        try {
                            const parsed = JSON.parse(jsonPayload)
                            const normalized = `data: ${JSON.stringify(parsed)}\n\n`
                            controller.enqueue(encoder.encode(normalized))
                        } catch (error) {
                            console.error("Failed to parse upstream notification", error)
                        }

                        boundary = buffer.indexOf("\n\n")
                    }
                }
            }
        })

        return new Response(stream, {
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