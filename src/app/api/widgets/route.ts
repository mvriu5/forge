import {createWidget, deleteWidget, getWidgetsFromDashboard, getWidgetsFromUser, updateWidget, getWidgetFromId, getDashboardFromId} from "@/database"
import {NextResponse} from "next/server"
import PostHogClient from "@/app/posthog"
import { requireServerUserId } from "@/lib/serverAuth"
const posthog = PostHogClient()

const routePath = "/api/widgets"

export async function POST(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const body = await req.json()
        const { dashboardId, widgetType, height, width, positionX, positionY } = body

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, userId, { route: routePath, method: "POST" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    let userId: string | undefined = undefined
    let dashboardId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const { searchParams } = new URL(req.url)
        dashboardId = searchParams.get('dashboardId') ?? undefined

        if (dashboardId) {
            const dashboard = (await getDashboardFromId(dashboardId))[0]

            if (!dashboard) return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
            if (dashboard.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

            const widgets = await getWidgetsFromDashboard(dashboardId)
            return NextResponse.json(widgets, { status: 200 })
        }

        const widgets = await getWidgetsFromUser(userId)
        return NextResponse.json(widgets, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, dashboardId, { route: routePath, method: "GET", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let id: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        const userId = auth.userId

        const body = await req.json()
        const { height, width, positionX, positionY, config, id: bodyId } = body
        id = bodyId ?? undefined

        if (!id) return NextResponse.json({ error: "Widget id is required" }, { status: 400 })

        const existing = (await getWidgetFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Widget not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const updateData = {
            height,
            width,
            positionX,
            positionY,
            config
        }

        const updatedWidget = await updateWidget(id, updateData)

        if (!updatedWidget) return NextResponse.json({ error: "Widget not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedWidget, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, id, { route: routePath, method: "PUT" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    let id: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        const userId = auth.userId

        const { searchParams } = new URL(req.url)
        id = searchParams.get('id') ?? undefined

        if (!id) return NextResponse.json({ error: "Widget id is required" }, { status: 400 })

        const existing = (await getWidgetFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Widget not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const deletedWidget = await deleteWidget(id)
        if (!deletedWidget) return NextResponse.json({ error: "Widget not found or could not be deleted" }, { status: 404 })

        return NextResponse.json(deletedWidget, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, id, { route: routePath, method: "DELETE" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
