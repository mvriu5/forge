import { createSettings, getSettingsFromId, getSettingsFromUser, updateSettings } from "@/database"
import { auth } from "@/lib/auth"
import { createSettingsSchema, updateSettingsSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const body = await req.json()
        const validationResult = createSettingsSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { config } = validationResult.data

        const settings = await createSettings({
            userId,
            config,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(settings, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const settings = await getSettingsFromUser(userId)
        return NextResponse.json(settings, { status: 200 })
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
        const validationResult = updateSettingsSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }
        const { id, lastDashboardId, config, onboardingCompleted } = validationResult.data

        const existing = (await getSettingsFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Settings not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const updatedSettings = await updateSettings(id, { lastDashboardId, config, onboardingCompleted })

        if (!updatedSettings) return NextResponse.json({ error: "Settings not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedSettings, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
