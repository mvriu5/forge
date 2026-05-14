import { Realtime } from "@upstash/realtime"
import { z } from "zod/v4"
import { notificationsEnabledServer } from "@/lib/notifications-server"
import { redis } from "@/lib/redis"

const notificationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.enum(["message", "alert", "reminder"]),
    message: z.string(),
    createdAt: z.string(),
})

export const realtime = notificationsEnabledServer && redis
    ? new Realtime({
        redis,
        schema: {
            notification: {
                created: notificationSchema,
            },
        },
    })
    : null

export type RealtimeEvents = {
    notification: {
        created: typeof notificationSchema
    }
}
