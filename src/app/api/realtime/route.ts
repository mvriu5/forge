import { handle } from "@upstash/realtime"
import { auth } from "@/lib/auth"
import { notificationsEnabledServer } from "@/lib/notifications-server"
import { realtime } from "@/lib/realtime"
import { headers } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    if (!notificationsEnabledServer || !realtime) {
        return new Response("Notifications disabled", { status: 503 })
    }

    const realtimeHandler = handle({
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

    return realtimeHandler(req)
}
