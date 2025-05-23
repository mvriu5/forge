import {NextResponse} from "next/server"
import {
    createDashboard,
    deleteDashboard,
    deleteWidgetsFromDashboard, getDashboardFromId,
    getDashboardsFromUser, getWidgetsFromDashboard, getWidgetsFromUser,
    updateDashboard
} from "@/database"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, name, isPublic } = body

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 })
        }

        const newDashboard = await createDashboard({
            userId,
            name,
            isPublic,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(newDashboard, { status: 201 })
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
        const id = searchParams.get('id')

        if (!userId && !id) {
            return NextResponse.json(
                { error: "userId or id is required as a query parameter" },
                { status: 400 })
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
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, name, isPublic } = body

        if (!id) {
            return NextResponse.json(
                { error: "Dashboard id is required" },
                { status: 400 })
        }

        const updatedDashboard = await updateDashboard(id, { name, isPublic })

        if (!updatedDashboard) {
            return NextResponse.json(
                { error: "Dashboard not found or could not be updated" },
                { status: 404 })
        }

        return NextResponse.json(updatedDashboard, { status: 200 })
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
                { error: "Dashboard id is required" },
                { status: 400 })
        }

        const deletedDashboard = await deleteDashboard(id)
        await deleteWidgetsFromDashboard(id)

        if (!deletedDashboard) {
            return NextResponse.json(
                { error: "Dashboard not found or could not be deleted" },
                { status: 404 })
        }

        return NextResponse.json(deletedDashboard, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}