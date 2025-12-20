import {NextResponse} from "next/server"
import {getUserFromId} from "@/database"
import PostHogClient from "@/app/posthog"
import { requireServerUserId } from "@/lib/serverAuth"
const posthog = PostHogClient()

const routePath = "/api/users"

export async function GET(req: Request) {
    let id: string | undefined = undefined

    try {
        const { searchParams } = new URL(req.url)
        id = searchParams.get('id') ?? undefined

        const { userId } = await requireServerUserId(req)
        const requestedUserId = id ?? userId

        if (id && id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const users = await getUserFromId(requestedUserId)
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, id, { route: routePath, method: "GET" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
