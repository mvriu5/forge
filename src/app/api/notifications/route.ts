import {redis} from "@/lib/redis"
import {Notification} from "@/database"
import {NextResponse} from "next/server"
import posthog from "posthog-js"
import {randomUUID} from "node:crypto"
import { requireServerUserId } from "@/lib/serverAuth"

const routePath = "/api/notifications"

export async function GET(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const key = `notifications:user:${userId}`
        const items = (await redis.lrange<Notification>(key, 0, 49)) ?? []
        return NextResponse.json(items.reverse(), { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, { route: routePath, method: "GET", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    let userId: string | undefined = undefined;

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const body = await req.json()
        const { type, message } = body

        if (!type) return NextResponse.json({ error: "type is required in the request body" }, { status: 400 })
        if (!message) return NextResponse.json({ error: "message is required in the request body" }, { status: 400 })

        const notification: Notification = {
            id: randomUUID(),
            userId,
            type,
            message,
            createdAt: new Date()
        }

        const listKey = `notifications:user:${userId}`
        const channel = `notifications:live:${userId}`

        await redis.lpush(listKey, notification)
        await redis.ltrim(listKey, 0, 99)
        await redis.publish(channel, notification)

        return NextResponse.json(notification, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, { route: routePath, method: "POST", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const key = `notifications:user:${userId}`
        await redis.del(key)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, { route: routePath, method: "DELETE", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
