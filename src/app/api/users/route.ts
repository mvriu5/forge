import {NextResponse} from "next/server"
import {getUserFromId} from "@/database"
import { requireServerUserId } from "@/lib/serverAuth"

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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
