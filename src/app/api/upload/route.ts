import {NextResponse} from "next/server"
import {put, del} from "@vercel/blob"
import { requireServerUserId } from "@/lib/serverAuth"

export async function POST(request: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(request)
        userId = auth.userId

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename || !request.body) return NextResponse.json({ error: "Filename is required" }, { status: 400 })

        try {
            const blob = await put(filename, request.body, { access: 'public' })
            return NextResponse.json(blob, { status: 200 })
        } catch {
            return NextResponse.json({ error: "Uploading failed" }, { status: 500 })
        }
    } catch (authError) {
        if ((authError as any)?.status === 401) return authError as any
        return NextResponse.json({ error: "Unauthorized or Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(request)
        userId = auth.userId

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });

        try {
            await del(filename)
            return NextResponse.json({ status: 200 })
        } catch {
            return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
        }
    } catch (authError) {
        if ((authError as any)?.status === 401) return authError as any
        return NextResponse.json({ error: "Unauthorized or Internal Server Error" }, { status: 500 })
    }
}
