import {createWidget, deleteWidget, getWidgetsFromDashboard, getWidgetsFromUser, updateWidget} from "@/database"
import {NextResponse} from "next/server"
import posthog from "posthog-js"

const routePath = "/api/widgets"

export async function POST(req: Request) {
    let userId: string | null = null

    try {
        const body = await req.json()
        const { dashboardId, widgetType, height, width, positionX, positionY } = body
        userId = body.userId

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const newWidget = await createWidget({
            userId,
            dashboardId,
            widgetType,
            height,
            width,
            positionX,
            positionY,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(newWidget, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "POST", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    let userId: string | null = null
    let dashboardId: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get('userId')
        dashboardId = searchParams.get('dashboardId')

        if (!userId && !dashboardId) {
            return NextResponse.json({ error: "userId or dashboardId is required as a query parameter" }, { status: 400 })
        }

        if (dashboardId) {
            const widgets = await getWidgetsFromDashboard(dashboardId)
            return NextResponse.json(widgets, { status: 200 })
        }

        if (userId) {
            const widgets = await getWidgetsFromUser(userId)
            return NextResponse.json(widgets, { status: 200 })
        }
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId, dashboardId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let id: string | null = null

    try {
        const body = await req.json()
        const { height, width, positionX, positionY, config } = body
        id = body.id

        if (!id) {
            return NextResponse.json({ error: "Widget id is required" }, { status: 400 })
        }

        const updateData = {
            height,
            width,
            positionX,
            positionY,
            config
        }

        const updatedWidget = await updateWidget(id, updateData)

        if (!updatedWidget) {
            return NextResponse.json({ error: "Widget not found or could not be updated" }, { status: 404 })
        }

        return NextResponse.json(updatedWidget, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "PUT", id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    let id: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "Widget id is required" }, { status: 400 })
        }

        const deletedWidget = await deleteWidget(id)

        if (!deletedWidget) {
            return NextResponse.json({ error: "Widget not found or could not be deleted" }, { status: 404 })
        }

        return NextResponse.json(deletedWidget, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "DELETE", id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}