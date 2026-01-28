import { createWidget, deleteWidget, getDashboardFromId, getWidgetFromId, getWidgetsFromDashboard, getWidgetsFromUser, updateWidget } from "@/database"
import { auth } from "@/lib/auth"
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
        const { dashboardId, widgetType, height, width, positionX, positionY } = body

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

        const { searchParams } = new URL(req.url)
        const dashboardId = searchParams.get('dashboardId') ?? undefined

        if (dashboardId) {
            const dashboard = (await getDashboardFromId(dashboardId))[0]

            if (!dashboard) return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
            if (dashboard.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

            const widgets = await getWidgetsFromDashboard(dashboardId)
            return NextResponse.json(widgets, { status: 200 })
        }

        const widgets = await getWidgetsFromUser(userId)
        return NextResponse.json(widgets, { status: 200 })
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
        const { height, width, positionX, positionY, config, id } = body

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
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id') ?? undefined
        if (!id) return NextResponse.json({ error: "Widget id is required" }, { status: 400 })

        const existing = (await getWidgetFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Widget not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const deletedWidget = await deleteWidget(id)
        if (!deletedWidget) return NextResponse.json({ error: "Widget not found or could not be deleted" }, { status: 404 })

        return NextResponse.json(deletedWidget, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
