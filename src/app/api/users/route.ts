import {NextResponse} from "next/server"
import {getUserFromId} from "@/database"
import posthog from "posthog-js"

const routePath = "/api/users"

export async function GET(req: Request) {
    let id: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "id is required as a query parameter" }, { status: 400 })
        }

        const users = await getUserFromId(id)
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}