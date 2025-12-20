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

        if (id) {
            const users = await getUserFromId(id)
            return NextResponse.json(users, { status: 200 })
        }

        const auth = await requireServerUserId(req)
        const userId = auth.userId

        const users = await getUserFromId(userId)
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, id, { route: routePath, method: "GET" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
