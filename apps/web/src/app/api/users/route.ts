import {NextResponse} from "next/server"
import {getUserFromId} from "@/database"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: "id is required as a query parameter" },
                { status: 400 }
            )
        }

        const users = await getUserFromId(id)
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}