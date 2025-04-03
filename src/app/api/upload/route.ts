import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 })
        }

        // Check if the file is an image
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 })
        }

        // Generate a unique filename
        const filename = `${Date.now()}-${file.name}`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: "public",
        })

        return NextResponse.json({
            url: blob.url,
            success: true,
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
    }
}

