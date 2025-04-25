import {createWidget, deleteWidget, getWidgetsFromDashboard, getWidgetsFromUser, updateWidget} from "@/database"
import {NextResponse} from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, dashboardId, widgetType, height, width, positionX, positionY } = body

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 })
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

        return NextResponse.json(newWidget, { status: 201 })
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
        const dashboardId = searchParams.get('dashboardId')

        if (!userId && !dashboardId) {
            return NextResponse.json(
                { error: "userId or dashboardId is required as a query parameter" },
                { status: 400 })
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
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, height, width, positionX, positionY, config } = body

        if (!id) {
            return NextResponse.json(
                { error: "Widget id is required" },
                { status: 400 })
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
            return NextResponse.json(
                { error: "Widget not found or could not be updated" },
                { status: 404 })
        }

        return NextResponse.json(updatedWidget, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: "Widget id is required" },
                { status: 400 })
        }

        const deletedWidget = await deleteWidget(id)

        if (!deletedWidget) {
            return NextResponse.json(
                { error: "Widget not found or could not be deleted" },
                { status: 404 })
        }

        return NextResponse.json(deletedWidget, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}