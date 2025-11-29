import {useCallback, useMemo} from "react"
import {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import { Widget } from "@/database"

function findFreePosition(relevantWidgets: Widget[], width: number, height: number, excludeId?: string, excludePosition?: { x: number; y: number; width: number; height: number }) {
    const occupiedCells: Record<string, boolean> = {}

    relevantWidgets.map((widget) => {
        if (excludeId && widget.id === excludeId) return

        for (let i = 0; i < widget.width; i++) {
            for (let j = 0; j < widget.height; j++) {
                occupiedCells[`${widget.positionX + i},${widget.positionY + j}`] = true
            }
        }
    })

    if (excludePosition) {
        for (let i = 0; i < excludePosition.width; i++) {
            for (let j = 0; j < excludePosition.height; j++) {
                occupiedCells[`${excludePosition.x + i},${excludePosition.y + j}`] = true
            }
        }
    }

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

            if (canPlace) return { x, y }
        }
    }

    return { x: 0, y: 0 }
}

export const useDragAndDrop = (editMode: boolean, widgets: Widget[] | undefined, currentDashboardId: string | null, updateWidgetPosition: (id: string, x: number, y: number) => void, setActiveWidget: (widget: Widget | null) => void) => {
    const relevantWidgets = useMemo(() => {
        if (!widgets || !currentDashboardId) return []
        return widgets.filter((widget) => widget.dashboardId === currentDashboardId)
    }, [widgets, currentDashboardId])

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

    const getConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        return relevantWidgets.filter((widget: { id: string; positionX: number; width: any; positionY: number; height: any }) => {
            if (widget.id === excludeId) return false

            return !(
                widget.positionX >= x + newWidget.width ||
                widget.positionX + widget.width <= x ||
                widget.positionY >= y + newWidget.height ||
                widget.positionY + widget.height <= y
            )
        })
    }, [relevantWidgets])

    const moveConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        const conflictingWidgets = getConflictingWidgets(newWidget, x, y, excludeId)

        conflictingWidgets.map((widget) => {
            const freePosition = findFreePosition(relevantWidgets, widget.width, widget.height, widget.id, {
                x,
                y,
                width: newWidget.width,
                height: newWidget.height,
            })

            updateWidgetPosition(widget.id, freePosition.x, freePosition.y)
        })
    }, [getConflictingWidgets, updateWidgetPosition])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (!editMode) return
        const { active } = event
        const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
        if (activeWidgetData) setActiveWidget(activeWidgetData)
    }, [editMode, setActiveWidget, relevantWidgets])

    const handleDragOver = useCallback((event: DragOverEvent) => {
        if (!editMode) return
        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }
            const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
            if (activeWidgetData) moveConflictingWidgets(activeWidgetData, x, y, active.id as string)
        }
    }, [editMode, moveConflictingWidgets, relevantWidgets])

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
