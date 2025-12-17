import { DndContext } from "@dnd-kit/core"
import {WidgetRenderer} from "@/components/WidgetRenderer"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {Widget} from "@/database"
import {useGrid} from "@/hooks/useGrid"
import React, {useMemo} from "react"
import {Grid} from "@/components/Grid"
import {cn} from "@/lib/utils"
import {useResponsiveLayout} from "@/hooks/media/useResponsiveLayout"

type DashboardGridProps = {
    editMode: boolean
    activeWidgetId: string | null
    currentDashboardId: string | null
    currentWidgets: Widget[]
    onWidgetDelete: (id: string) => void
    onWidgetUpdate: (widget: Widget) => Promise<Widget>
    updateWidgetPosition: (id: string, x: number, y: number) => void
    visibleWidgets: Widget[]
    activeWidget: Widget | null
    setActiveWidget: React.Dispatch<React.SetStateAction<Widget | null>>
}

const DashboardGrid = React.memo<DashboardGridProps>(function DashboardGrid({editMode, activeWidgetId, onWidgetDelete, onWidgetUpdate, currentDashboardId, currentWidgets, updateWidgetPosition, visibleWidgets, activeWidget, setActiveWidget}) {
    const { transformedWidgets, gridClasses, isDesktop } = useResponsiveLayout(visibleWidgets)
    const { sensors, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop(
        editMode,
        currentWidgets,
        currentDashboardId,
        updateWidgetPosition,
        setActiveWidget,
    )

    const gridCells = useGrid(activeWidget, visibleWidgets)

    const widgetElements = useMemo(() => transformedWidgets?.map((widget) => (
        <WidgetRenderer
            key={widget.id}
            widget={widget}
            editMode={editMode}
            onWidgetDelete={onWidgetDelete}
            onWidgetUpdate={onWidgetUpdate}
            isDragging={activeWidgetId === widget.id}
        />
    )), [transformedWidgets, editMode, onWidgetDelete, onWidgetUpdate, activeWidgetId])

    const content = useMemo(() => (
        <div className={cn("relative w-full h-screen", gridClasses)}>
            <Grid cells={gridCells} enabled={isDesktop}/>
            {widgetElements}
        </div>
    ), [gridClasses, gridCells, isDesktop, widgetElements])

    return (
        <DndContext
            sensors={sensors}
            onDragStart={editMode ? handleDragStart : undefined}
            onDragEnd={editMode ? handleDragEnd : undefined}
            onDragOver={editMode ? handleDragOver : undefined}
        >
            {content}
        </DndContext>
    )
}, (prev, next) => (
    prev.editMode === next.editMode
    && prev.activeWidgetId === next.activeWidgetId
    && prev.onWidgetDelete === next.onWidgetDelete
    && prev.onWidgetUpdate === next.onWidgetUpdate
    && prev.currentDashboardId === next.currentDashboardId
    && prev.currentWidgets === next.currentWidgets
    && prev.updateWidgetPosition === next.updateWidgetPosition
    && prev.visibleWidgets === next.visibleWidgets
    && prev.activeWidget === next.activeWidget
    && prev.setActiveWidget === next.setActiveWidget
))

export { DashboardGrid }