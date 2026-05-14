import { getWidgetFromId, updateWidgetsLayout } from "@/database"
import { auth } from "@/lib/auth"
import { updateWidgetsLayoutSchema } from "@/lib/validations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const userId = session.user.id

        const body = await req.json()
        const validationResult = updateWidgetsLayoutSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json("Invalid request body", { status: 400 })
        }

        const { widgets } = validationResult.data
        if (widgets.length === 0) return NextResponse.json([], { status: 200 })

        const existingWidgets = await Promise.all(widgets.map((widget) => getWidgetFromId(widget.id)))
        const flattenedWidgets = existingWidgets.flat()

        if (flattenedWidgets.length !== widgets.length) {
            return NextResponse.json({ error: "Widget not found" }, { status: 404 })
        }

        if (flattenedWidgets.some((widget) => widget.userId !== userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updatedWidgets = await updateWidgetsLayout(widgets)

        return NextResponse.json(updatedWidgets, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
