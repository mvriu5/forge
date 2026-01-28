import { auth } from "@/lib/auth"
import { del, put } from "@vercel/blob"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename || !request.body) return NextResponse.json({ error: "Filename is required" }, { status: 400 })

        const blob = await put(filename, request.body, { access: 'public' })
        return NextResponse.json(blob, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Uploading failed" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')
        if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });

        await del(filename)
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
    }
}
