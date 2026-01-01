import {NextResponse} from "next/server"
import {createSettings, getSettingsFromUser, updateSettings, getSettingsFromId} from "@/database"
import { requireServerUserId } from "@/lib/serverAuth"

export async function POST(req: Request) {
    const auth = await requireServerUserId(req)
    const userId = auth.userId

    try {
        const body = await req.json()
        const { config } = body

        const settings = await createSettings({
            userId,
            config,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(settings, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const auth = await requireServerUserId(req)
    const userId = auth.userId

    try {
        const settings = await getSettingsFromUser(userId)
        return NextResponse.json(settings, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const auth = await requireServerUserId(req)
    const userId = auth.userId

    let id: string | undefined = undefined

    try {
        const body = await req.json()
        const { lastDashboardId, config, onboardingCompleted, id: bodyId } = body
        id = bodyId ?? undefined

        if (!id) {
            return NextResponse.json({ error: "Settings id is required" }, { status: 400 })
        }

        const existing = (await getSettingsFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Settings not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const updatedSettings = await updateSettings(id, { lastDashboardId, config, onboardingCompleted })

        if (!updatedSettings) return NextResponse.json({ error: "Settings not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedSettings, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
