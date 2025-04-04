import {NextResponse} from "next/server"
import {put, del} from "@vercel/blob"

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename || !request.body) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    const blob = await put(filename, request.body, {
        access: 'public'
    })

    return NextResponse.json(blob)
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    try {
        await del(filename)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting file:", error)
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
    }
}

