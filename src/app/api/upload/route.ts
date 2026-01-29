import { auth } from "@/lib/auth"
import { fileUploadSchema } from "@/lib/validations";
import { del, put } from "@vercel/blob"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = fileUploadSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { filename } = validationResult.data

        if (!request.body) return NextResponse.json({ error: "File content is required" }, { status: 400 })

        const blob = await put(`${session.user.id}/${filename}`, request.body, { access: 'public' })
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

        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = fileUploadSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { filename } = validationResult.data

        await del(`${session.user.id}/${filename}`)
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
    }
}
