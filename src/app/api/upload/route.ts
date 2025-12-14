import {NextResponse} from "next/server"
import {put, del} from "@vercel/blob"
import posthog from "posthog-js"

const routePath = "/api/upload"

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename || !request.body) return NextResponse.json({ error: "Filename is required" }, { status: 400 })

    try {
        const blob = await put(filename, request.body, { access: 'public' })
        return NextResponse.json(blob, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "POST", filename })
        return NextResponse.json({ error: "Uploading failed" }, { status: 500 })
    }

}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });

    try {
        await del(filename)
        return NextResponse.json({ status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "DELETE", filename })
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
    }
}

