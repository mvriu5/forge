import { Widget } from "@/database"
import {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import { useCallback, useEffect, useMemo, useRef } from "react"

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
    const pendingPositionUpdatesRef = useRef(new Map<string, { x: number; y: number }>())
    const animationFrameRef = useRef<number | null>(null)
    const relevantWidgets = useMemo(() => {
        if (!widgets || !currentDashboardId) return []
        const alreadyScoped = widgets.every((widget) => widget.dashboardId === currentDashboardId)
        return alreadyScoped ? widgets : widgets.filter((widget) => widget.dashboardId === currentDashboardId)
    }, [widgets, currentDashboardId])

    const flushPositionUpdates = useCallback(() => {
        animationFrameRef.current = null
        const updates = Array.from(pendingPositionUpdatesRef.current.entries())
        pendingPositionUpdatesRef.current.clear()

        for (const [id, position] of updates) {
            updateWidgetPosition(id, position.x, position.y)
        }
    }, [updateWidgetPosition])

    const scheduleWidgetPositionUpdate = useCallback((id: string, x: number, y: number) => {
        pendingPositionUpdatesRef.current.set(id, {x, y})

        if (animationFrameRef.current === null) {
            animationFrameRef.current = window.requestAnimationFrame(flushPositionUpdates)
        }
    }, [flushPositionUpdates])

    useEffect(() => () => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

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

            scheduleWidgetPositionUpdate(widget.id, freePosition.x, freePosition.y)
            movedWidgets.push({ id: widget.id, x: freePosition.x, y: freePosition.y, width: widget.width, height: widget.height })
        }
    }, [getConflictingWidgets, scheduleWidgetPositionUpdate, relevantWidgets])

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
            scheduleWidgetPositionUpdate(active.id as string, x, y)
        }

        setActiveWidget(null)
    }, [editMode, scheduleWidgetPositionUpdate, setActiveWidget])

    return { sensors, handleDragStart, handleDragOver, handleDragEnd }
}
