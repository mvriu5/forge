import { deleteAccount, getAccountsFromUser } from "@/database"
import { auth } from "@/lib/auth"
import { deleteAccountSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const accounts = (await getAccountsFromUser(userId)).map((account) => ({
            id: account.id,
            accountId: account.accountId,
            userId: account.userId,
            provider: account.providerId,
            connected: Boolean(account.accessToken || account.refreshToken),
            accessTokenExpiresAt: account.accessTokenExpiresAt,
            createdAt: account.createdAt,
        }))

        return NextResponse.json(accounts, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const { searchParams } = new URL(req.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = deleteAccountSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { provider } = validationResult.data

        const deletedAccount = deleteAccount(userId, provider)
        if (!deletedAccount) return NextResponse.json({ error: "Account not found" }, { status: 404 })

        return NextResponse.json(deletedAccount, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

