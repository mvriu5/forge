import { Grid } from "@/components/Grid"
import { WidgetRenderer } from "@/components/WidgetRenderer"
import { Widget } from "@/database"
import { useResponsiveLayout } from "@/hooks/media/useResponsiveLayout"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"
import { useGrid } from "@/hooks/useGrid"
import { cn } from "@/lib/utils"
import { DndContext } from "@dnd-kit/core"
import React from "react"

interface DashboardGridProps {
    editMode: boolean
    activeWidgetId: string | null
    currentDashboardId: string | null
    widgets: Widget[]
    activeWidget: Widget | null
    setActiveWidget: React.Dispatch<React.SetStateAction<Widget | null>>
    updateWidgetPosition: (id: string, x: number, y: number) => void
    onWidgetDelete: (id: string) => void
    onWidgetUpdate: (widget: Widget) => Promise<Widget>
    isFullscreen?: boolean
}

const DashboardGrid = React.memo<DashboardGridProps>(function DashboardGrid({
    editMode,
    activeWidgetId,
    currentDashboardId,
    widgets,
    activeWidget,
    setActiveWidget,
    updateWidgetPosition,
    onWidgetDelete,
    onWidgetUpdate,
    isFullscreen
}) {
    const {transformedWidgets, gridClasses, isDesktop} = useResponsiveLayout(widgets, isFullscreen)
    const gridCells = useGrid(activeWidget, widgets)

    const {sensors, handleDragStart, handleDragEnd, handleDragOver} = useDragAndDrop(
        editMode,
        widgets,
        currentDashboardId,
        updateWidgetPosition,
        setActiveWidget
    )

    return (
        <DndContext
            sensors={sensors}
            onDragStart={editMode ? handleDragStart : undefined}
            onDragEnd={editMode ? handleDragEnd : undefined}
            onDragOver={editMode ? handleDragOver : undefined}
        >
            <div className={cn("relative w-full", gridClasses)}>
                <Grid cells={gridCells} enabled={isDesktop}/>
                {transformedWidgets?.map(widget => (
                    <WidgetRenderer
                        key={widget.id}
                        widget={widget}
                        editMode={editMode}
                        isDragging={activeWidgetId === widget.id}
                        onWidgetDelete={onWidgetDelete}
                        onWidgetUpdate={onWidgetUpdate}
                    />
                ))}
            </div>
        </DndContext>
    )
})

export { DashboardGrid }
