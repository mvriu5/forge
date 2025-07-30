"use client"

import {Header} from "@/components/Header"
import React, {memo, useCallback, useEffect, useRef, useState} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent, getWidgetPreview} from "@/lib/widgetRegistry"
import {useIntegrationStore} from "@/store/integrationStore"
import {DndContext, useDroppable} from "@dnd-kit/core"
import type {Widget} from "@/database"
import {EmptyAddSVG} from "@/components/svg/EmptyAddSVG"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {Blocks, CloudAlert} from "lucide-react"
import {useToast} from "@/components/ui/ToastProvider"
import {useShallow} from "zustand/react/shallow"
import {useGrid} from "@/hooks/useGrid"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {useDashboardStore} from "@/store/dashboardStore"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"
import {useHotkeys} from "react-hotkeys-hook"
import {SpinnerDotted} from "spinners-react"
import {useSettingsStore} from "@/store/settingsStore"
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout"
import {cn} from "@/lib/utils"
import {useBreakpoint} from "@/hooks/useBreakpoint"
import {GridCell} from "@/components/GridCell"

export default function Dashboard() {
    const { session, fetchSession } = useSessionStore()
    const { currentDashboard, getAllDashboards } = useDashboardStore()
    const { widgets, getAllWidgets, removeWidget, saveWidgetsLayout } = useWidgetStore()
    const { integrations, fetchIntegrations } = useIntegrationStore()
    console.log("Integrations:", integrations)
    const { fetchSettings } = useSettingsStore()
    const { addToast } = useToast()

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const gridCells = useGrid(activeWidget)
    const { sensors, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop(editMode, setActiveWidget)

    useHotkeys("mod+e", (event) => {
        event.preventDefault()
        if (widgets?.filter((w) => w && w?.dashboardId === currentDashboard?.id).length === 0) return
        if (!editMode) setEditMode(true)
    }, [editMode, widgets, currentDashboard])

    const cachedWidgetsRef = useRef<Widget[] | null>(null)

    const currentWidgets = useWidgetStore(useShallow((s) => s.widgets?.filter((w) => w && w?.dashboardId === currentDashboard?.id) || []))

    const { transformedWidgets, gridClasses, containerHeight, isDesktop } = useResponsiveLayout(currentWidgets)

    useEffect(() => {
        setLoading(true)
        fetchSession()
    }, [fetchSession])

    useEffect(() => {
        if (!session?.user) return
        setLoading(true)

        Promise.all([
            getAllDashboards(session.user.id),
            getAllWidgets(session.user.id),
            fetchIntegrations(session.user.id),
            fetchSettings(session.user.id)
        ])
        .then(() => {
            const ds = useDashboardStore.getState().dashboards
            if (!ds || ds.length === 0) setDialogOpen(true)
        })
        .catch()
        .finally(() => setLoading(false))
    }, [session?.user?.id, getAllDashboards, getAllWidgets, fetchIntegrations])

    const handleEditModeEnter = useCallback(() => {
        setEditMode(true)
        cachedWidgetsRef.current = useWidgetStore.getState().widgets
    }, [])

    const handleEditModeSave = useCallback(async () => {
        try {
            setEditModeLoading(true)
            if (!widgets) return

            if (widgetsToRemove.length > 0)  await Promise.all(widgetsToRemove.map((widget) => removeWidget(widget)))

            await saveWidgetsLayout()

            addToast({
                title: "Successfully updated your layout",
                icon: <Blocks size={24} className={"text-brand"}/>
            })
        } catch (error) {
            addToast({
                title: "An error occurred",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
        } finally {
            setEditMode(false)
            setEditModeLoading(false)
            setWidgetsToRemove([])
        }
    }, [removeWidget, saveWidgetsLayout, addToast, widgets, widgetsToRemove])

    const handleEditModeCancel = useCallback(() => {
        if (cachedWidgetsRef.current) useWidgetStore.setState({ widgets: cachedWidgetsRef.current })
        setEditMode(false)
        setWidgetsToRemove([])
    }, [])

    const handleEditModeDelete = useCallback((id: string) => {
        const widget = useWidgetStore.getState().widgets?.find(w => w.id === id)
        if (widget) setWidgetsToRemove((w) => [...w, widget])
    }, [])

    const widgetsEmpty = widgets?.filter((w) => w.dashboardId === currentDashboard?.id).length === 0

    return (
        <div className={cn("flex flex-col w-full h-full overflow-hidden", isDesktop && "max-h-screen max-w-screen")}>
            <Header
                onEdit={handleEditModeEnter}
                editMode={editMode}
                editModeLoading={editModeLoading}
                handleEditModeSave={handleEditModeSave}
                handleEditModeCancel={handleEditModeCancel}
                isLoading={loading}
                widgetsEmpty={widgetsEmpty && currentDashboard !== null}
            />
            {loading ? (
                <div className={"h-screen w-screen flex items-center justify-center"}>
                    <SpinnerDotted size={56} thickness={160} speed={100} color="rgba(237, 102, 49, 1)" />
                </div>
            ) : (
                <>
                    {widgetsEmpty && currentDashboard ? (
                        <div className={"w-full h-screen flex items-center justify-center"}>
                            <div className={"flex flex-col gap-4 items-center justify-center p-4 md:p-12 border border-main border-dashed rounded-md shadow-md dark:shadow-xl"}>
                                <EmptyAddSVG/>
                                <p className={"w-56 md:w-80 text-center text-sm"}>
                                    You dont have any widgets in your dashboard. Add a new widget, by visiting the widget store.
                                </p>
                                <WidgetDialog editMode={false} title={"Widget-Store"}/>
                            </div>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                        >
                            <div className={cn("relative w-full", containerHeight, gridClasses)}>
                                {isDesktop && gridCells?.map((cell) => (
                                    <GridCell
                                        key={`${cell.x},${cell.y}`}
                                        x={cell.x}
                                        y={cell.y}
                                        width={cell.width}
                                        height={cell.height}
                                        isDroppable={cell.isDroppable}
                                    />
                                ))}

                                {transformedWidgets
                                    ?.filter((widget) => !widgetsToRemove?.some((w) => w.id === widget.id))
                                    .map((widget) => (
                                        <MemoizedWidget
                                            key={widget.id}
                                            widget={widget}
                                            editMode={editMode}
                                            onDelete={handleEditModeDelete}
                                            isDragging={activeWidget?.id === widget.id}
                                        />
                                    ))}
                            </div>
                        </DndContext>
                    )}
                </>
            )}
            <DashboardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                showOnClose={false}
            />
        </div>
    )
}

interface WidgetProps {
    widget: Widget
    onDelete: (id: string) => void
    editMode: boolean
    isDragging: boolean
}

const WidgetOverlay = ({ widget, onDelete, editMode, isDragging }: WidgetProps) => {
    const {breakpoint} = useBreakpoint()

    const Component = getWidgetComponent(widget.widgetType)
    const widgetPreview = getWidgetPreview(widget.widgetType)
    if (!widgetPreview) return null

    const handleDelete = useCallback(() => onDelete(widget.id), [onDelete, widget.id])
    if (!Component) return null

    const responsiveSize = widgetPreview.preview.sizes[breakpoint]

    return (
        <div
            className={`transition-opacity duration-200 ${isDragging ? "opacity-50" : "opacity-100"}`}
            style={{
                gridColumnStart: widget.positionX + 1,
                gridRowStart: widget.positionY + 1,
                gridColumnEnd: widget.positionX + 1 + responsiveSize.width,
                gridRowEnd: widget.positionY + 1 + responsiveSize.height,
            }}
        >
            <Component key={widget.id} id={widget.id} editMode={editMode} onWidgetDelete={handleDelete} />
        </div>
    )
}

const MemoizedWidget = memo(WidgetOverlay, (prev, next) =>
    prev.widget.id === next.widget.id &&
    prev.widget.positionX === next.widget.positionX &&
    prev.widget.positionY === next.widget.positionY &&
    prev.widget.height === next.widget.height &&
    prev.widget.width === next.widget.width &&
    prev.onDelete === next.onDelete &&
    prev.editMode === next.editMode &&
    prev.isDragging === next.isDragging
)
