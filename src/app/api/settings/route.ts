import {NextResponse} from "next/server"
import {createSettings, getSettingsFromUser, updateSettings} from "@/database"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, config } = body

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 })
        }

        const settings = await createSettings({
            userId,
            config,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(settings, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required as a query parameter" },
                { status: 400 })
        }

        const settings = await getSettingsFromUser(userId)
        return NextResponse.json(settings, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, config } = body

        if (!id) {
            return NextResponse.json(
                { error: "Settings id is required" },
                { status: 400 })
        }

        const updatedSettings = await updateSettings(id, { config })

        if (!updatedSettings) {
            return NextResponse.json(
                { error: "Settings not found or could not be updated" },
                { status: 404 })
        }

        return NextResponse.json(updatedSettings, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}