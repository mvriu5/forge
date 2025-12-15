import {NextResponse} from "next/server"
import {
    createDashboard,
    deleteDashboard,
    deleteWidgetsFromDashboard, getDashboardFromId,
    getDashboardsFromUser, getWidgetsFromDashboard, getWidgetsFromUser,
    updateDashboard
} from "@/database"
import posthog from "posthog-js"

const routePath = "/api/dashboards"

export async function POST(req: Request) {
    let userId: string | null = null
    try {
        const body = await req.json()
        const { name } = body
        userId = body.userId

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const newDashboard = await createDashboard({
            userId,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(newDashboard, { status: 201 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "POST", userId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    let userId: string | null = null
    let id: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId")
        id = searchParams.get("id")

        if (!userId && !id) {
            return NextResponse.json({ error: "userId or id is required as a query parameter" }, { status: 400 })
        }

        if (id) {
            const dashboards = await getDashboardFromId(id)
            return NextResponse.json(dashboards, { status: 200 })
        }

        if (userId) {
            const dashboards = await getDashboardsFromUser(userId)
            return NextResponse.json(dashboards, { status: 200 })
        }
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId, id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let id: string | null = null

    try {
        const body = await req.json()
        const { name } = body
        id = body.id

        if (!id) {
            return NextResponse.json({ error: "Dashboard id is required" }, { status: 400 })
        }

        const updatedDashboard = await updateDashboard(id, { name })

        if (!updatedDashboard) {
            return NextResponse.json({ error: "Dashboard not found or could not be updated" }, { status: 404 })
        }

        return NextResponse.json(updatedDashboard, { status: 200 })
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
            return NextResponse.json({ error: "Dashboard id is required" }, { status: 400 })
        }

        const deletedDashboard = await deleteDashboard(id)
        await deleteWidgetsFromDashboard(id)

        if (!deletedDashboard) {
            return NextResponse.json({ error: "Dashboard not found or could not be deleted" }, { status: 404 })
        }

        return NextResponse.json(deletedDashboard, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "DELETE", id })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}