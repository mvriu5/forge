import { useCallback } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import { DragStartEvent, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core"
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

    const findFreePosition = useCallback((width: number, height: number, excludeId?: string, excludePosition?: { x: number; y: number; width: number; height: number }) => {
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

        // Mark the position we're trying to place the widget at as occupied
        if (excludePosition) {
            for (let i = 0; i < excludePosition.width; i++) {
                for (let j = 0; j < excludePosition.height; j++) {
                    occupiedCells[`${excludePosition.x + i},${excludePosition.y + j}`] = true
                }
            }
        }

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

        return { x: 0, y: 0 } // Fallback
    }, [currentDashboard?.id])

    const getConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        const widgets = useWidgetStore.getState().widgets?.filter((w) => w.dashboardId === currentDashboard?.id) || []

        return widgets.filter((widget) => {
            if (widget.id === excludeId) return false

            return !(
                widget.positionX >= x + newWidget.width ||
                widget.positionX + widget.width <= x ||
                widget.positionY >= y + newWidget.height ||
                widget.positionY + widget.height <= y
            )
        })
    }, [currentDashboard?.id])

    const moveConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        const conflictingWidgets = getConflictingWidgets(newWidget, x, y, excludeId)

        conflictingWidgets.forEach((widget) => {
            const freePosition = findFreePosition(widget.width, widget.height, widget.id, {
                x,
                y,
                width: newWidget.width,
                height: newWidget.height,
            })

            updateWidgetPosition(widget.id, freePosition.x, freePosition.y)
        })
    }, [getConflictingWidgets, findFreePosition, updateWidgetPosition])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (!editMode) return
        const { active } = event
        const activeWidgetData = useWidgetStore.getState().widgets?.find((w) => w.id === active.id)
        if (activeWidgetData) setActiveWidget(activeWidgetData)
    }, [editMode, setActiveWidget])

    const handleDragOver = useCallback((event: DragOverEvent) => {
        if (!editMode) return
        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }
            const activeWidgetData = useWidgetStore.getState().widgets?.find((w) => w.id === active.id)

            if (activeWidgetData) moveConflictingWidgets(activeWidgetData, x, y, active.id as string)
        }
    }, [editMode, moveConflictingWidgets])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!editMode) return
        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }
            updateWidgetPosition(active.id as string, x, y)
        }

        setActiveWidget(null)
    }, [editMode, updateWidgetPosition, setActiveWidget])

    return { sensors, handleDragStart, handleDragOver, handleDragEnd }
}
