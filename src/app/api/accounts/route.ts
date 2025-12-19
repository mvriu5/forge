import {NextResponse} from "next/server"
import {Account, getGithubAccount, getGoogleAccount, getNotionAccount, updateAccount} from "@/database"
import posthog from "posthog-js"

const routePath = "/api/accounts"

export async function GET(req: Request) {
    let userId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required as a query parameter" },
                { status: 400 }
            )
        }

        const accounts: Account[] = []
        accounts.push((await getGoogleAccount(userId))[0])
        accounts.push((await getGithubAccount(userId))[0])
        accounts.push((await getNotionAccount(userId))[0])

        return NextResponse.json(accounts, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let userId: string | null = null
    try {
        const body = await req.json()
        const { provider, refreshToken } = body
        userId = body.userId

        if (!userId || !provider) {
            return NextResponse.json({ error: "UserId and Integration are required" }, { status: 400 })
        }

        const updatedAccount = await updateAccount(userId, provider, {refreshToken})

        if (!updatedAccount) {
            return NextResponse.json({ error: "Account not found or could not be updated" }, { status: 404 })
        }

        return NextResponse.json(updatedAccount, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "PUT", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
