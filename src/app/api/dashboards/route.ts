import {NextResponse} from "next/server"
import {createDashboard, deleteDashboard, getDashboardsFromUser, updateDashboard} from "@/database"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userId, name } = body

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 })
        }

        const newDashboard = await createDashboard({
            userId,
            name,
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

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required as a query parameter" },
                { status: 400 })
        }

        const dashboards = await getDashboardsFromUser(userId)
        console.log(dashboards)

        return NextResponse.json(dashboards, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, name } = body

        if (!id) {
            return NextResponse.json(
                { error: "Dashboard id is required" },
                { status: 400 })
        }

        const updateData = { name }

        const updatedDashboard = await updateDashboard(id, updateData)

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