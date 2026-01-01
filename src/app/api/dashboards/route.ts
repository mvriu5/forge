import {
    createDashboard,
    deleteDashboard,
    deleteWidgetsFromDashboard, getDashboardFromId,
    getDashboardsFromUser,
    updateDashboard
} from "@/database"
import { requireServerUserId } from "@/lib/serverAuth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    let userId: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const body = await req.json()
        const { name } = body

        const newDashboard = await createDashboard({
            userId,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json(newDashboard, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    let userId: string | undefined = undefined
    let id: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        userId = auth.userId

        const { searchParams } = new URL(req.url)
        id = searchParams.get("id") ?? undefined

        if (id) {
            const dashboard = (await getDashboardFromId(id))[0]

            if (!dashboard) return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
            if (dashboard.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

            return NextResponse.json([dashboard], { status: 200 })
        }

        const dashboards = await getDashboardsFromUser(userId)
        return NextResponse.json(dashboards, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    let id: string | undefined = undefined

    try {
        const auth = await requireServerUserId(req)
        const userId = auth.userId

        const body = await req.json()
        const { name, id: bodyId } = body
        id = bodyId ?? undefined

        if (!id) return NextResponse.json({ error: "Dashboard id is required" }, { status: 400 })

        const existing = (await getDashboardFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const updatedDashboard = await updateDashboard(id, { name })

        if (!updatedDashboard) return NextResponse.json({ error: "Dashboard not found or could not be updated" }, { status: 404 })

        return NextResponse.json(updatedDashboard, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
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

        if (!id) return NextResponse.json({ error: "Dashboard id is required" }, { status: 400 })

        const existing = (await getDashboardFromId(id))[0]
        if (!existing) return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
        if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const deletedDashboard = await deleteDashboard(id)
        await deleteWidgetsFromDashboard(id)

        if (!deletedDashboard) return NextResponse.json({ error: "Dashboard not found or could not be deleted" }, { status: 404 })

        return NextResponse.json(deletedDashboard, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
