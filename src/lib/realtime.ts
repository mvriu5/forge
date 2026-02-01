import { Realtime, type InferRealtimeEvents } from "@upstash/realtime"
import { z } from "zod/v4"
import { redis } from "@/lib/redis"

const notificationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.enum(["message", "alert", "reminder"]),
    message: z.string(),
    createdAt: z.string(),
})

export const realtime = new Realtime({
    redis,
    schema: {
        notification: {
            created: notificationSchema,
        },
    },
})

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>
