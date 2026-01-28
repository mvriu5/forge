import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const isAbortError = (error: unknown) => {
    if (error instanceof DOMException) return error.name === "AbortError"
    return typeof error === "object" && error !== null && "name" in error && (error as { name?: string }).name === "AbortError"
}

const isTerminatedFetchError = (error: unknown) => {
    return error instanceof TypeError && (error.message === "terminated" || error.message === "fetch failed")
}

export async function GET(req: Request) {
    let userId: string | undefined = undefined

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new Response("Unauthorized", { status: 401 })
        userId = session.user.id

        const channel = `notifications:live:${userId}`
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/subscribe/${encodeURIComponent(channel)}`

        let upstream: Response
        try {
            upstream = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                },
                cache: "no-store",
            })
        } catch (error) {
            if (isAbortError(error) || isTerminatedFetchError(error)) {
                return new Response(null, { status: 499 })
            }

            console.error("api/notifications/stream upstream subscribe failed", error, { method: "GET", userId })
            return new Response("Upstream subscribe failed", { status: 502 })
        }

        if (!upstream.ok || !upstream.body) {
            return new Response("Upstream subscribe failed", { status: 502 })
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const reader = upstream.body.getReader()
        let buffer = ""
        let streamClosed = false

        const cancelUpstream = async () => {
            if (streamClosed) return
            streamClosed = true

            try {
                await reader.cancel()
            } catch (error) {
                if (isAbortError(error)) return
                console.error("api/notifications/stream cancelUpstream error", error, { method: "GET", userId })
            }
        }

        req.signal.addEventListener("abort", () => {
            void cancelUpstream()
        })

        const stream = new ReadableStream({
            async pull(controller) {
                if (streamClosed) return
                while (!streamClosed) {
                    try {
                        const { done, value } = await reader.read()

                        if (streamClosed) return

                        if (done) {
                            if (buffer.length > 0 && !streamClosed) controller.enqueue(encoder.encode(buffer))
                            if (!streamClosed) {
                                streamClosed = true
                                controller.close()
                            }
                            await cancelUpstream()
                            return
                        }

                        buffer += decoder.decode(value, { stream: true })

                        let boundary = buffer.indexOf("\n\n")
                        while (!streamClosed && boundary !== -1) {
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
                                if (streamClosed) return
                                const parsed = JSON.parse(jsonPayload)
                                const normalized = `data: ${JSON.stringify(parsed)}\n\n`
                                controller.enqueue(encoder.encode(normalized))
                            } catch (error) {
                                console.error("api/notifications/stream parse error", error, { method: "GET", userId })
                            }

                            boundary = buffer.indexOf("\n\n")
                        }
                    } catch (error) {
                        if (streamClosed || isAbortError(error) || isTerminatedFetchError(error)) {
                            streamClosed = true
                            controller.close()
                            await cancelUpstream()
                            return
                        }

                        console.error("api/notifications/stream stream error", error, { method: "GET", userId })
                        streamClosed = true
                        controller.error(error)
                        await cancelUpstream()
                    }
                }
            },
            async cancel() {
                await cancelUpstream()
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
    } catch {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
}
