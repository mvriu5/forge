import { Redis } from "@upstash/redis"
import { notificationsEnabledServer } from "@/lib/notifications-server"

export const redis = notificationsEnabledServer
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
    : null
