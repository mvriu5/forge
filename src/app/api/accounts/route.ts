import {NextResponse} from "next/server"
import {Account, getGithubAccount, getGoogleAccount, getNotionAccount, updateAccount} from "@/database"
import PostHogClient from "@/app/posthog"
import { requireServerUserId } from "@/lib/serverAuth"
const posthog = PostHogClient()

const routePath = "/api/accounts"

export async function GET(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const accounts: Account[] = []
        accounts.push((await getGoogleAccount(userId))[0])
        accounts.push((await getGithubAccount(userId))[0])
        accounts.push((await getNotionAccount(userId))[0])

        return NextResponse.json(accounts, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, userId, { route: routePath, method: "GET" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const body = await req.json()
        const { provider, refreshToken } = body

        if (!provider) return NextResponse.json({ error: "Integration provider is required" }, { status: 400 })

        const updatedAccount = await updateAccount(userId, provider, {refreshToken})

        if (!updatedAccount) return NextResponse.json({ error: "Account not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedAccount, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, userId, { route: routePath, method: "PUT" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
