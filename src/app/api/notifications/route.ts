import { Notification } from "@/database"
import { auth } from "@/lib/auth"
import { redis } from "@/lib/redis"
import { realtime } from "@/lib/realtime"
import { createNotificationSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const key = `notifications:user:${userId}`
        const items = (await redis.lrange<Notification>(key, 0, 49)) ?? []
        return NextResponse.json(items.reverse(), { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const body = await req.json()
        const validationResult = createNotificationSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { type, message } = validationResult.data

        const notification: Notification = {
            id: randomUUID(),
            userId,
            type,
            message,
            createdAt: new Date()
        }

        const listKey = `notifications:user:${userId}`

        await redis.lpush(listKey, notification)
        await redis.ltrim(listKey, 0, 99)
        await realtime.channel(`user-${userId}`).emit("notification.created", {
            ...notification,
            createdAt: notification.createdAt.toISOString(),
        })

        return NextResponse.json(notification, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const key = `notifications:user:${userId}`
        await redis.del(key)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
