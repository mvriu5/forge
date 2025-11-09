import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Widget, WidgetInsert} from "@/database"

const WIDGETS_QUERY_KEY = (userId: string | undefined) => ["widgets", userId] as const

async function fetchWidgets(userId: string): Promise<Widget[]> {
    const response = await fetch(`/api/widgets?userId=${userId}`)

    if (!response.ok) {
        throw new Error("Failed to fetch widgets")
    }

    return response.json()
}

async function createWidget(widget: WidgetInsert & { userId: string }): Promise<Widget> {
    const response = await fetch("/api/widgets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(widget)
    })

    if (!response.ok) {
        throw new Error("Failed to create widget")
    }

    const data = await response.json()
    return data[0]
}

async function updateWidgetRequest(widget: Widget): Promise<Widget> {
    const response = await fetch(`/api/widgets?id=${widget.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(widget)
    })

    if (!response.ok) {
        throw new Error("Failed to update widget")
    }

    const data = await response.json()
    return data[0]
}

async function deleteWidgetRequest(id: string): Promise<void> {
    const response = await fetch(`/api/widgets?id=${id}`, {method: "DELETE"})

    if (!response.ok) {
        throw new Error("Failed to delete widget")
    }
}

function findNextAvailablePosition(widgets: Widget[] | undefined, newWidgetWidth: number, newWidgetHeight: number, dashboardId: string): { x: number, y: number } | null {
    const relevant = widgets?.filter((w) => w.dashboardId === dashboardId) ?? []
    if (relevant.length === 0) return { x: 0, y: 0 }

    const gridSize = 4
    const occupiedCells: boolean[][] = Array(gridSize)
        .fill(false)
        .map(() => Array(gridSize).fill(false))

    relevant.map((widget) => {
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

    return null
}

export function useWidgets(userId: string | undefined) {
    const queryClient = useQueryClient()

    const widgetsQuery = useQuery({
        queryKey: WIDGETS_QUERY_KEY(userId),
        queryFn: () => fetchWidgets(userId!),
        enabled: !!userId,
    })

    const addWidgetMutation = useMutation({
        mutationFn: async (widget: WidgetInsert) => {
            const widgets = queryClient.getQueryData<Widget[]>(WIDGETS_QUERY_KEY(userId))
            const position = findNextAvailablePosition(widgets, widget.width, widget.height, widget.dashboardId)

            if (!position) {
                throw new Error("Not enough space in your dashboard!")
            }

            return createWidget({
                ...widget,
                positionX: position.x,
                positionY: position.y,
                userId: userId!,
            })
        },
        onSuccess: (widget) => {
            queryClient.setQueryData(WIDGETS_QUERY_KEY(userId), (previous: Widget[] | undefined) => {
                if (!previous) return [widget]
                return [...previous, widget]
            })
        }
    })

    const refreshWidgetMutation = useMutation({
        mutationFn: updateWidgetRequest,
        onSuccess: (updatedWidget) => {
            queryClient.setQueryData(WIDGETS_QUERY_KEY(userId), (previous: Widget[] | undefined) => {
                if (!previous) return previous
                return previous.map((widget) => widget.id === updatedWidget.id ? updatedWidget : widget)
            })
        }
    })

    const removeWidgetMutation = useMutation({
        mutationFn: deleteWidgetRequest,
        onSuccess: (_, widgetId) => {
            queryClient.setQueryData(WIDGETS_QUERY_KEY(userId), (previous: Widget[] | undefined) => {
                if (!previous) return previous
                return previous.filter((widget) => widget.id !== widgetId)
            })
        }
    })

    const saveWidgetsLayoutMutation = useMutation({
        mutationFn: async () => {
            const widgets = queryClient.getQueryData<Widget[]>(WIDGETS_QUERY_KEY(userId)) ?? []

            await Promise.all(
                widgets.map(async (widget) => {
                    const response = await fetch("/api/widgets", {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(widget)
                    })

                    if (!response.ok) {
                        throw new Error(`Error saving widget ${widget.id}`)
                    }
                })
            )
        },
    })

    const updateWidgetPosition = (id: string, x: number, y: number) => {
        queryClient.setQueryData(WIDGETS_QUERY_KEY(userId), (previous: Widget[] | undefined) => {
            if (!previous) return previous
            return previous.map((widget) => widget.id === id ? {...widget, positionX: x, positionY: y} : widget)
        })
    }

    const getWidget = (dashboardId: string, widgetName: string) => {
        const widgets = queryClient.getQueryData<Widget[]>(WIDGETS_QUERY_KEY(userId))
        return widgets?.find((widget) => widget.widgetType === widgetName && widget.dashboardId === dashboardId)
    }

    const setWidgets = (updater: Widget[] | ((widgets: Widget[]) => Widget[])) => {
        if (!userId) return
        queryClient.setQueryData(WIDGETS_QUERY_KEY(userId), (previous: Widget[] | undefined) => {
            const current = previous ?? []
            return typeof updater === "function"
                ? (updater as (widgets: Widget[]) => Widget[])(current)
                : updater
        })
    }

    return {
        widgets: widgetsQuery.data ?? [],
        isLoading: widgetsQuery.isLoading,
        refetchWidgets: widgetsQuery.refetch,
        addWidget: (widget: WidgetInsert) => addWidgetMutation.mutateAsync(widget),
        updateWidget: (widget: Widget) => refreshWidgetMutation.mutateAsync(widget),
        removeWidget: (id: string) => removeWidgetMutation.mutateAsync(id),
        saveWidgetsLayout: () => saveWidgetsLayoutMutation.mutateAsync(),
        updateWidgetPosition,
        getWidget,
        setWidgets,
        addWidgetStatus: addWidgetMutation.status,
        updateWidgetStatus: refreshWidgetMutation.status,
        removeWidgetStatus: removeWidgetMutation.status,
        saveWidgetsLayoutStatus: saveWidgetsLayoutMutation.status,
    }
}