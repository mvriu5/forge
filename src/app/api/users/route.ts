import { getUserFromId } from "@/database"
import { auth } from "@/lib/auth"
import { getUserSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const { searchParams } = new URL(req.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = getUserSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { id } = validationResult.data

        const requestedUserId = id ?? userId

        if (id && id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const users = await getUserFromId(requestedUserId)
        return NextResponse.json(users, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
