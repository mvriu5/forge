import { useCallback } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import { DragStartEvent, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import {useDashboardStore} from "@/store/dashboardStore"

export const useDragAndDrop = (editMode: boolean, setActiveWidget: (widget: any) => void) => {
    const { updateWidgetPosition } = useWidgetStore()
    const { currentDashboard } = useDashboardStore()

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    )

    const findFreePosition = useCallback((width: number, height: number, excludeId?: string) => {
        const widgets = useWidgetStore.getState().widgets?.filter((w) => w.dashboardId === currentDashboard?.id) || []
        const occupiedCells: Record<string, boolean> = {}

        // Mark all occupied cells
        widgets.forEach((widget) => {
            if (excludeId && widget.id === excludeId) return

            for (let i = 0; i < widget.width; i++) {
                for (let j = 0; j < widget.height; j++) {
                    occupiedCells[`${widget.positionX + i},${widget.positionY + j}`] = true
                }
            }
        })

        // Find first free position
        for (let y = 0; y <= 4 - height; y++) {
            for (let x = 0; x <= 4 - width; x++) {
                let canPlace = true

                for (let i = 0; i < width && canPlace; i++) {
                    for (let j = 0; j < height && canPlace; j++) {
                        if (occupiedCells[`${x + i},${y + j}`]) {
                            canPlace = false
                        }
                    }
                }

                if (canPlace) {
                    return { x, y }
                }
            }
        }

        return { x: 0, y: 0 }
    }, [currentDashboard?.id])

    const canPlaceWidget = useCallback((widget: { width: number; height: number }, x: number, y: number, excludeId?: string) => {
        const widgets = useWidgetStore.getState().widgets?.filter((w) => w.dashboardId === currentDashboard?.id) || []
        const { width, height } = widget

        // Check if the widget would go out of bounds
        if (x + width > 4 || y + height > 4) {
            return false
        }

        // Check if any of the cells are occupied by other widgets
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const conflictingWidget = widgets.find((w) => {
                    if (excludeId && w.id === excludeId) return false

                    return (
                        w.positionX <= x + i &&
                        w.positionX + w.width > x + i &&
                        w.positionY <= y + j &&
                        w.positionY + w.height > y + j
                    )
                })

                if (conflictingWidget) {
                    return false
                }
            }
        }

        return true
    }, [currentDashboard?.id])

    const moveConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        const widgets = useWidgetStore.getState().widgets?.filter((w) => w.dashboardId === currentDashboard?.id) || []

        const conflictingWidgets = widgets.filter((widget) => {
            if (widget.id === excludeId) return false

            // Check if widgets overlap
            return !(
                widget.positionX >= x + newWidget.width ||
                widget.positionX + widget.width <= x ||
                widget.positionY >= y + newWidget.height ||
                widget.positionY + widget.height <= y
            )
        })

        // Move each conflicting widget to a free position
        conflictingWidgets.forEach((widget) => {
            const freePosition = findFreePosition(widget.width, widget.height, widget.id)
            updateWidgetPosition(widget.id, freePosition.x, freePosition.y)
        })
    }, [currentDashboard?.id, findFreePosition, updateWidgetPosition])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (!editMode) return
        const { active } = event
        const activeWidgetData = useWidgetStore.getState().widgets?.find((w) => w.id === active.id)
        if (activeWidgetData) setActiveWidget(activeWidgetData)
    }, [editMode, setActiveWidget])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!editMode) return
        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }
            const activeWidgetData = useWidgetStore.getState().widgets?.find((w) => w.id === active.id)

            if (activeWidgetData) {
                // Move conflicting widgets first
                moveConflictingWidgets(activeWidgetData, x, y, active.id as string)

                // Then update the dragged widget position with a small delay
                setTimeout(() => {
                    updateWidgetPosition(active.id as string, x, y)
                }, 100)
            }
        }
        setActiveWidget(null)
    }, [editMode, updateWidgetPosition, setActiveWidget, moveConflictingWidgets])

    return { sensors, handleDragStart, handleDragEnd }
}
