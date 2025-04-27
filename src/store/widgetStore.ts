import {create} from "zustand/react"
import {Widget, WidgetInsert} from "@/database"

interface WidgetStore {
    widgets: Widget[] | null
    addWidget: (userId: string, widget: WidgetInsert) => Promise<void>
    refreshWidget: (widget: Widget) => Promise<void>
    removeWidget: (widget: Widget) => Promise<void>
    getWidget: (widgetName: string) => Widget | undefined
    getAllWidgets: (userId: string) => Promise<void>
    updateWidgetPosition: (id: string, x: number, y: number) => void
    saveWidgetsLayout: () => Promise<void>
}

export const useWidgetStore = create<WidgetStore>((set, get) => ({
    widgets: [] as Widget[],

    addWidget: async (userId: string, widget: WidgetInsert) => {
        const { x, y } = findNextAvailablePosition(get().widgets, widget.width, widget.height, widget.dashboardId)
        const widgetWithPosition = { ...widget, positionX: x, positionY: y, userId }
        try {
            const response = await fetch("/api/widgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(widgetWithPosition)
            })
            const newWidget = await response.json()
            set({ widgets: [...(get().widgets || []), newWidget[0]] })
        } catch (error) {
            set({ widgets: get().widgets })
        }
    },

    refreshWidget: async (widget: Widget) => {
        try {
            const response = await fetch(`/api/widgets?id=${widget.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(widget)
            })
            const updatedWidget = await response.json()
            set({
                widgets: get().widgets!.map((w) =>
                    w.id === updatedWidget[0].id ? updatedWidget[0] : w
                )
            })
        } catch (error) {
            set({ widgets: get().widgets })
        }
    },

    removeWidget: async (widget: Widget) => {
        try {
            await fetch(`/api/widgets?id=${widget.id}`, { method: "DELETE" })

            set({
                widgets: get().widgets!.filter((w) => w.id !== widget.id)
            })
        } catch (error) {
            set({ widgets: get().widgets })
        }
    },

    getWidget: (widgetName: string) => {
        return get().widgets?.find((widget) => widget.widgetType === widgetName)
    },

    getAllWidgets: async (userId: string) => {
        try {
            const response = await fetch(`/api/widgets?userId=${userId}`)
            const widgets = await response.json()
            set({ widgets })
        } catch (error) {
            set({ widgets: get().widgets })
        }
    },

    updateWidgetPosition: (id: string, x: number, y: number) => {
        set((state) => ({
            widgets: state.widgets!.map((widget) =>
                widget.id === id ? { ...widget, positionX: x, positionY: y } : widget
            )
        }))
    },

    saveWidgetsLayout: async () => {
        const { widgets } = get()
        if (!widgets) return

        await Promise.all(
            widgets.map(async (widget) => {
                const response = await fetch("/api/widgets", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(widget)
                })
                if (!response.ok) {
                    throw new Error(`Error saving widget ${widget.id}`)
                }
            })
        )
    }
}))

const findNextAvailablePosition = (widgets: Widget[] | null, newWidgetWidth: number, newWidgetHeight: number, dashboardId: string): { x: number, y: number } => {
    const relevant = widgets?.filter(w => w.dashboardId === dashboardId) ?? []
    if (relevant.length === 0) return { x: 0, y: 0 }

    const gridSize = 4 // 4x4 Grid
    const occupiedCells: boolean[][] = Array(gridSize)
        .fill(false)
        .map(() => Array(gridSize).fill(false))

    relevant.map(widget => {
        for (let i = 0; i < widget.width; i++) {
            for (let j = 0; j < widget.height; j++) {
                const x = widget.positionX + i
                const y = widget.positionY + j

                if (x < gridSize && y < gridSize) {
                    occupiedCells[y][x] = true
                }
            }
        }
    })

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let canPlace = true

            if (x + newWidgetWidth > gridSize || y + newWidgetHeight > gridSize) {
                canPlace = false
                continue
            }

            for (let i = 0; i < newWidgetWidth; i++) {
                for (let j = 0; j < newWidgetHeight; j++) {
                    if (occupiedCells[y + j][x + i]) {
                        canPlace = false
                        break
                    }
                }
                if (!canPlace) break
            }

            if (canPlace) return { x, y }
        }
    }

    return { x: 0, y: 0 }
}