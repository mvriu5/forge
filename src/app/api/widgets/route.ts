import { createWidget, deleteWidget, getWidgetsFromUser, updateWidget } from "@/database"
import {NextResponse} from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, widgetType, height, width, positionX, positionY } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const newWidget = await createWidget({
            userId,
            widgetType,
            height,
            width,
            positionX,
            positionY,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json(newWidget, { status: 201 });
    } catch (error) {
        console.log("Error creating widget:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// READ (GET) - Retrieve widgets for a user
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required as a query parameter" },
                { status: 400 }
            );
        }

        const widgets = await getWidgetsFromUser(userId);

        return NextResponse.json(widgets, { status: 200 });
    } catch (error) {
        console.log("Error retrieving widgets:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, height, width, positionX, positionY } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Widget id is required" },
                { status: 400 }
            );
        }

        const updateData = {
            height,
            width,
            positionX,
            positionY
        };

        const updatedWidget = await updateWidget(id, updateData);

        if (!updatedWidget) {
            return NextResponse.json(
                { error: "Widget not found or could not be updated" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedWidget, { status: 200 });
    } catch (error) {
        console.log("Error updating widget:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE (DELETE) - Remove a specific widget
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Widget id is required" },
                { status: 400 }
            );
        }

        const deletedWidget = await deleteWidget(id);

        if (!deletedWidget) {
            return NextResponse.json(
                { error: "Widget not found or could not be deleted" },
                { status: 404 }
            );
        }

        return NextResponse.json(deletedWidget, { status: 200 });
    } catch (error) {
        console.log("Error deleting widget:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}