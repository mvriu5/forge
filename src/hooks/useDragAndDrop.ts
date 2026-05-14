import { Widget } from "@/database"
import {
    DragCancelEvent,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import { useCallback, useMemo, useState, useEffect } from "react"

function findFreePosition(relevantWidgets: Widget[], width: number, height: number, excludeId?: string, excludePosition?: { x: number, y: number, width: number, height: number }) {
    const occupiedCells: Record<string, boolean> = {}

    for (const widget of relevantWidgets) {
        if (excludeId && widget.id === excludeId) continue

        for (let i = 0; i < widget.width; i++) {
            for (let j = 0; j < widget.height; j++) {
                occupiedCells[`${widget.positionX + i},${widget.positionY + j}`] = true
            }
        }
    }

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
    const [swapPreview, setSwapPreview] = useState<{
        widgetId: string
        x: number
        y: number
        drop: { x: number; y: number; width: number; height: number }
    } | null>(null)

    const relevantWidgets = useMemo(() => {
        if (!widgets || !currentDashboardId) return []
        const alreadyScoped = widgets.every((widget) => widget.dashboardId === currentDashboardId)
        return alreadyScoped ? widgets : widgets.filter((widget) => widget.dashboardId === currentDashboardId)
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

    const canPlaceAt = useCallback((widget: Widget, x: number, y: number, excludeIds: string[]) => {
        if (x < 0 || y < 0 || x + widget.width > 4 || y + widget.height > 4) return false

        return !relevantWidgets.some((candidate) => {
            if (excludeIds.includes(candidate.id)) return false

            return !(
                candidate.positionX >= x + widget.width ||
                candidate.positionX + candidate.width <= x ||
                candidate.positionY >= y + widget.height ||
                candidate.positionY + candidate.height <= y
            )
        })
    }, [relevantWidgets])

    const moveConflictingWidgets = useCallback((newWidget: { width: number; height: number }, x: number, y: number, excludeId: string) => {
        const conflictingWidgets = getConflictingWidgets(newWidget, x, y, excludeId)
        const movedWidgets: Array<{ id: string; x: number; y: number; width: number; height: number }> = []

        for (const widget of conflictingWidgets) {
            const updatedWidgets = relevantWidgets.map(w => {
                const moved = movedWidgets.find(m => m.id === w.id)
                return moved ? { ...w, positionX: moved.x, positionY: moved.y } : w
            })

            const freePosition = findFreePosition(updatedWidgets, widget.width, widget.height, widget.id, {  // <-- FIX 🟢 use updatedWidgets reflecting prior moves
                x,
                y,
                width: newWidget.width,
                height: newWidget.height,
            })

            updateWidgetPosition(widget.id, freePosition.x, freePosition.y)
            movedWidgets.push({ id: widget.id, x: freePosition.x, y: freePosition.y, width: widget.width, height: widget.height })
        }
    }, [getConflictingWidgets, relevantWidgets, updateWidgetPosition])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (!editMode) return
        setSwapPreview(null)
        const { active } = event
        const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
        if (activeWidgetData) setActiveWidget(activeWidgetData)
    }, [editMode, setActiveWidget, relevantWidgets])

    const handleDragOver = useCallback((event: DragOverEvent) => {
        if (!editMode) return
        const { active, over } = event

        if (!over || active.id === over.id) {
            setSwapPreview(null)
            return
        }

        if (typeof over.id === "string" && over.id.startsWith("widget-drop-")) {
            const overData = over.data.current as { widgetId?: string } | undefined
            const targetId = overData?.widgetId
            const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
            const targetWidgetData = targetId ? relevantWidgets.find((w) => w.id === targetId) : null

            if (!activeWidgetData || !targetWidgetData || targetWidgetData.id === activeWidgetData.id) {
                setSwapPreview(null)
                return
            }

            const canMoveActiveToTarget = canPlaceAt(
                activeWidgetData,
                targetWidgetData.positionX,
                targetWidgetData.positionY,
                [activeWidgetData.id, targetWidgetData.id]
            )
            const canMoveTargetToActive = canPlaceAt(
                targetWidgetData,
                activeWidgetData.positionX,
                activeWidgetData.positionY,
                [activeWidgetData.id, targetWidgetData.id]
            )

            if (canMoveActiveToTarget && canMoveTargetToActive) {
                setSwapPreview({
                    widgetId: targetWidgetData.id,
                    x: activeWidgetData.positionX,
                    y: activeWidgetData.positionY,
                    drop: {
                        x: targetWidgetData.positionX,
                        y: targetWidgetData.positionY,
                        width: activeWidgetData.width,
                        height: activeWidgetData.height
                    }
                })
            } else {
                setSwapPreview(null)
            }

            return
        }

        setSwapPreview(null)

        if (typeof over.id === "string" && over.id.startsWith("cell-")) {
            const { x, y } = over.data.current as { x: number; y: number }
            if (typeof x !== "number" || typeof y !== "number") return
            const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
            if (activeWidgetData) moveConflictingWidgets(activeWidgetData, x, y, active.id as string)
        }
    }, [canPlaceAt, editMode, moveConflictingWidgets, relevantWidgets])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!editMode) return
        setSwapPreview(null)
        const { active, over } = event

        if (over && active.id !== over.id) {
            const activeWidgetData = relevantWidgets.find((w) => w.id === active.id)
            if (!activeWidgetData) {
                setActiveWidget(null)
                return
            }

            if (typeof over.id === "string" && over.id.startsWith("widget-drop-")) {
                const overData = over.data.current as { widgetId?: string } | undefined
                const targetId = overData?.widgetId
                const targetWidgetData = targetId ? relevantWidgets.find((w) => w.id === targetId) : null

                if (targetWidgetData && targetWidgetData.id !== activeWidgetData.id) {
                    const canMoveActiveToTarget = canPlaceAt(
                        activeWidgetData,
                        targetWidgetData.positionX,
                        targetWidgetData.positionY,
                        [activeWidgetData.id, targetWidgetData.id]
                    )
                    const canMoveTargetToActive = canPlaceAt(
                        targetWidgetData,
                        activeWidgetData.positionX,
                        activeWidgetData.positionY,
                        [activeWidgetData.id, targetWidgetData.id]
                    )

                    if (canMoveActiveToTarget && canMoveTargetToActive) {
                        updateWidgetPosition(targetWidgetData.id, activeWidgetData.positionX, activeWidgetData.positionY)
                        updateWidgetPosition(activeWidgetData.id, targetWidgetData.positionX, targetWidgetData.positionY)
                    }
                }
            } else if (typeof over.id === "string" && over.id.startsWith("cell-")) {
                const { x, y } = over.data.current as { x: number; y: number }
                if (typeof x === "number" && typeof y === "number") {
                    const canMoveToCell = canPlaceAt(activeWidgetData, x, y, [activeWidgetData.id])
                    if (canMoveToCell) updateWidgetPosition(active.id as string, x, y)
                }
            }
        }

        setActiveWidget(null)
    }, [canPlaceAt, editMode, relevantWidgets, setActiveWidget, updateWidgetPosition])

    const handleDragCancel = useCallback((_: DragCancelEvent) => {
        setSwapPreview(null)
        setActiveWidget(null)
    }, [setActiveWidget])

    return { sensors, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel, swapPreview }
}
