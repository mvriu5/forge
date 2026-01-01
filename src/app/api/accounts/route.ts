import {NextResponse} from "next/server"
import {Account, deleteAccount, getGithubAccount, getGoogleAccount, getNotionAccount, updateAccount} from "@/database"
import { requireServerUserId } from "@/lib/serverAuth"

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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const { searchParams } = new URL(req.url)
        const provider = searchParams.get("provider")

        if (!provider) return NextResponse.json({ error: "Integration provider is required" }, { status: 400 })

        const deletedAccount = deleteAccount(userId, provider)
        if (!deletedAccount) return NextResponse.json({ error: "Account not found" }, { status: 404 })

        return NextResponse.json(deletedAccount, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
