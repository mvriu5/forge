import { auth } from "@/lib/auth"
import { blobDeleteSchema, fileUploadSchema } from "@/lib/validations"
import { del, put } from "@vercel/blob"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
])

const hasValidImageSignature = (bytes: Uint8Array, contentType: string): boolean => {
    if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    if (contentType === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])
    if (contentType === "image/webp") {
        return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    }
    return false
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = fileUploadSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 })
        }
        if (!request.body) return NextResponse.json({ error: "File content is required" }, { status: 400 })

        const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? ""
        const extension = ALLOWED_IMAGE_TYPES.get(contentType)
        if (!extension) {
            return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 415 })
        }

        const contentLength = Number(request.headers.get("content-length") ?? 0)
        if (contentLength > MAX_AVATAR_BYTES) {
            return NextResponse.json({ error: "Image exceeds the 5 MB limit" }, { status: 413 })
        }

        const bytes = new Uint8Array(await request.arrayBuffer())
        if (bytes.byteLength === 0 || bytes.byteLength > MAX_AVATAR_BYTES) {
            return NextResponse.json({ error: "Image exceeds the 5 MB limit" }, { status: 413 })
        }
        if (!hasValidImageSignature(bytes, contentType)) {
            return NextResponse.json({ error: "File content does not match its image type" }, { status: 415 })
        }

        const pathname = `${session.user.id}/avatars/${randomUUID()}.${extension}`
        const blob = await put(pathname, Buffer.from(bytes), {
            access: "public",
            contentType,
            addRandomSuffix: false,
        })
        return NextResponse.json(blob, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Uploading failed" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(request.url)
        const query = Object.fromEntries(searchParams.entries())
        const validationResult = blobDeleteSchema.safeParse(query)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 })
        }
        const { url } = validationResult.data
        const blobUrl = new URL(url)
        const isVercelBlob = blobUrl.protocol === "https:" && blobUrl.hostname.endsWith(".blob.vercel-storage.com")
        const belongsToUser = blobUrl.pathname.startsWith(`/${session.user.id}/`)
        if (!isVercelBlob || !belongsToUser) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await del(blobUrl.toString())
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
    }
}
