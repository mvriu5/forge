import {redis} from "@/lib/redis"
import {Notification} from "@/database"
import {NextResponse} from "next/server"
import posthog from "posthog-js"
import {randomUUID} from "node:crypto"

const routePath = "/api/notifications"

export async function GET(req: Request) {
    let userId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "userId is required as a query parameter" }, { status: 400 })
        }

        const key = `notifications:user:${userId}`
        const items = (await redis.lrange<Notification>(key, 0, 49)) ?? []
        return NextResponse.json(items.reverse(), { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    let userId: string | null = null;

    try {
        const body = await req.json()
        userId = body.userId ?? null

        if (!userId) {
            return NextResponse.json({ error: "userId is required in the request body" }, { status: 400 })
        }

        if (!body.type) {
            return NextResponse.json({ error: "type is required in the request body" }, { status: 400 })
        }

        if (!body.message) {
            return NextResponse.json({ error: "message is required in the request body" }, { status: 400 })
        }

        const notification: Notification = {
            id: randomUUID(),
            userId,
            type: body.type,
            message: body.message,
            createdAt: new Date()
        }


        const listKey = `notifications:user:${userId}`
        const channel = `notifications:live:${userId}`

        await redis.lpush(listKey, notification)
        await redis.ltrim(listKey, 0, 99)
        await redis.publish(channel, notification)

        return NextResponse.json(notification, { status: 201 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "POST", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    let userId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "userId is required as a query parameter" }, { status: 400 })
        }

        const key = `notifications:user:${userId}`
        await redis.del(key)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "DELETE", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}