import {NextResponse} from "next/server"
import {Account, getGithubAccount, getLinearAccount} from "@/database"

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
        const accounts: Account[] = []
        accounts.push((await getGithubAccount(userId))[0])
        accounts.push((await getLinearAccount(userId))[0])

        return NextResponse.json(accounts, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}