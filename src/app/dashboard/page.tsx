"use client"

import {Header} from "@/components/Header"
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {getWidgetComponent, getWidgetPreview} from "@/lib/widgetRegistry"
import {DndContext} from "@dnd-kit/core"
import type {Widget} from "@/database"
import {EmptyAddSVG} from "@/components/svg/EmptyAddSVG"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {Blocks, CloudAlert} from "lucide-react"
import {useToast} from "@/components/ui/ToastProvider"
import {useGrid} from "@/hooks/useGrid"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"
import {useHotkeys} from "react-hotkeys-hook"
import {SpinnerDotted} from "spinners-react"
import {useResponsiveLayout} from "@/hooks/media/useResponsiveLayout"
import {cn} from "@/lib/utils"
import {GridCell} from "@/components/GridCell"
import {useSession} from "@/hooks/data/useSession"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useWidgets} from "@/hooks/data/useWidgets"
import {useSettings} from "@/hooks/data/useSettings"

export default function Dashboard() {
    const { session, refetchSession, isLoading: sessionLoading } = useSession()
    const userId = session?.user?.id

    const {dashboards, isLoading: dashboardsLoading} = useDashboards(userId)
    const {widgets, isLoading: widgetsLoading, removeWidget, saveWidgetsLayout, updateWidgetPosition, setWidgets} = useWidgets(userId)
    const {settings, isLoading: settingsLoading, updateSettings} = useSettings(userId)
    const { addToast } = useToast()

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const dataLoading = sessionLoading || dashboardsLoading || widgetsLoading || settingsLoading

    const currentDashboard = useMemo(() => {
        if (!dashboards || dashboards.length === 0) return null
        if (settings?.lastDashboardId) {
            return dashboards.find((dashboard) => dashboard.id === settings.lastDashboardId) ?? dashboards[0]
        }
        return dashboards[0]
    }, [dashboards, settings?.lastDashboardId])

    const currentWidgets = useMemo(
        () => widgets.filter((widget) => widget.dashboardId === currentDashboard?.id),
        [widgets, currentDashboard?.id]
    )

    const cachedWidgetsRef = useRef<Widget[] | null>(null)

    const gridCells = useGrid(activeWidget, currentWidgets)
    const { sensors, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop(
        editMode,
        widgets,
        currentDashboard?.id ?? null,
        updateWidgetPosition,
        setActiveWidget,
    )

    useHotkeys("mod+e", (event) => {
        event.preventDefault()
        if (currentWidgets.length === 0) return
        if (!editMode) setEditMode(true)
    }, [editMode, currentWidgets])

    useEffect(() => {
        refetchSession()
    }, [refetchSession])


    useEffect(() => {
        if (!userId) return
        if (dashboardsLoading) return
        if (dashboards && dashboards.length === 0) setDialogOpen(true)
    }, [userId, dashboards, dashboardsLoading])


    const handleEditModeEnter = useCallback(() => {
        setEditMode(true)
        cachedWidgetsRef.current = widgets
    }, [widgets])

    const handleEditModeSave = useCallback(async () => {
        try {
            setEditModeLoading(true)
            if (widgetsToRemove.length > 0) {
                await Promise.all(widgetsToRemove.map((widget) => removeWidget(widget.id)))
            }
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
            cachedWidgetsRef.current = null
        }
    }, [removeWidget, saveWidgetsLayout, addToast, widgetsToRemove])

    const handleEditModeCancel = useCallback(() => {
        if (cachedWidgetsRef.current) setWidgets(cachedWidgetsRef.current)
        setEditMode(false)
        setWidgetsToRemove([])
        cachedWidgetsRef.current = null
    }, [setWidgets])

    const handleEditModeDelete = useCallback((id: string) => {
        const widget = widgets.find((w) => w.id === id)
        if (widget) setWidgetsToRemove((prev) => [...prev, widget])
    }, [widgets])

    const widgetsEmpty = currentWidgets.length === 0

    const { transformedWidgets, gridClasses, containerHeight, isDesktop } = useResponsiveLayout(currentWidgets)

    return (
        <div className={cn("flex flex-col w-full h-full overflow-hidden", isDesktop && "max-h-screen max-w-screen")}>
            <Header
                onEdit={handleEditModeEnter}
                editMode={editMode}
                editModeLoading={editModeLoading}
                handleEditModeSave={handleEditModeSave}
                handleEditModeCancel={handleEditModeCancel}
                isLoading={dataLoading}
                widgetsEmpty={widgetsEmpty && currentDashboard !== null}
                dashboards={dashboards ?? []}
                currentDashboard={currentDashboard}
                settings={settings}
                onDashboardChange={async (dashboardId) => {
                    if (!settings) return
                    await updateSettings({
                        ...settings,
                        lastDashboardId: dashboardId,
                    })
                }}
                userId={userId}
            />
            {dataLoading ? (
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
                                <WidgetDialog
                                    editMode={false}
                                    title={"Widget-Store"}
                                    currentDashboard={currentDashboard}
                                    userId={userId}
                                />
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

const WidgetComponent = ({ widget, onDelete, editMode, isDragging }: WidgetProps) => {
    const WidgetContent = getWidgetComponent(widget.widgetType)
    const preview = getWidgetPreview(widget.widgetType)

    if (!WidgetContent || !preview) return null

    return (
        <WidgetContent
            widget={widget}
            onDelete={onDelete}
            editMode={editMode}
            isDragging={isDragging}
        />
    )
}

const MemoizedWidget = memo(WidgetComponent)