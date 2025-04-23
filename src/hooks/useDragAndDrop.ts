import { useCallback } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import { DragStartEvent, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"

export const useDragAndDrop = (editMode: boolean, setActiveWidget: (widget: any) => void) => {
    const { updateWidgetPosition } = useWidgetStore()

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
            updateWidgetPosition(active.id as string, x, y)
        }
        setActiveWidget(null)
    }, [editMode, updateWidgetPosition, setActiveWidget])

    return { sensors, handleDragStart, handleDragEnd }
}
