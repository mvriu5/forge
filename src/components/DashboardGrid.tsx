import {DndContext} from "@dnd-kit/core"
import {WidgetRenderer} from "@/components/WidgetRenderer"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {Widget} from "@/database"
import {useGrid} from "@/hooks/useGrid"
import React from "react"
import {Grid} from "@/components/Grid"
import {cn} from "@/lib/utils"
import {useResponsiveLayout} from "@/hooks/media/useResponsiveLayout"

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
    onWidgetUpdate
}) {
    const {transformedWidgets, gridClasses, isDesktop} = useResponsiveLayout(widgets)
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

export {DashboardGrid}