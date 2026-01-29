import { Account, deleteAccount, getGithubAccount, getGoogleAccount, getNotionAccount, updateAccount } from "@/database"
import { auth } from "@/lib/auth"
import { deleteAccountSchema, updateAccountSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const accounts: Account[] = []
        accounts.push((await getGoogleAccount(userId))[0])
        accounts.push((await getGithubAccount(userId))[0])
        accounts.push((await getNotionAccount(userId))[0])

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

export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const body = await req.json()
        const validationResult = updateAccountSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { provider, refreshToken } = validationResult.data

        const updatedAccount = await updateAccount(userId, provider, {refreshToken})
        if (!updatedAccount) return NextResponse.json({ error: "Account not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedAccount, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
