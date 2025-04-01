import {NextResponse} from "next/server"
import {getGithubAccount} from "@/database"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required as a query parameter" },
                { status: 400 }
            )
        }

        const account = await getGithubAccount(userId)

        return NextResponse.json(account, { status: 200 })
    } catch (error) {
        console.log("Error retrieving account:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}