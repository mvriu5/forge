import {NextResponse} from "next/server"
import {createSettings, getSettingsFromUser, updateSettings} from "@/database"
import posthog from "posthog-js"

const routePath = "/api/settings"

export async function POST(req: Request) {
    let userId: string | null = null

    try {
        const body = await req.json()
        const { config } = body
        userId = body.userId

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const settings = await createSettings({
            userId,
            config,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(settings, { status: 201 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "POST", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    let userId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: "userId is required as a query parameter" }, { status: 400 })
        }

        const settings = await getSettingsFromUser(userId)
        return NextResponse.json(settings, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let id: string | null = null

    try {
        const body = await req.json()
        const { lastDashboardId, config } = body
        id = body.id

        if (!id) {
            return NextResponse.json({ error: "Settings id is required" }, { status: 400 })
        }

        const updatedSettings = await updateSettings(id, { lastDashboardId, config })

        if (!updatedSettings) {
            return NextResponse.json({ error: "Settings not found or could not be updated" }, { status: 404 })
        }

        return NextResponse.json(updatedSettings, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "PUT", id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}