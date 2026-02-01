import { handle } from "@upstash/realtime"
import { auth } from "@/lib/auth"
import { realtime } from "@/lib/realtime"
import { headers } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const GET = handle({
    realtime,
    middleware: async ({ channels }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) return new Response("Unauthorized", { status: 401 })

        const userChannel = `user-${session.user.id}`
        for (const channel of channels) {
            if (channel !== userChannel) {
                return new Response("Forbidden", { status: 403 })
            }
        }
    },
})
