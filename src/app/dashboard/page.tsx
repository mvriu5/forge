"use client"

import {Header} from "@/components/Header"
import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {DndContext} from "@dnd-kit/core"
import type {Widget} from "@/database"
import {useGrid} from "@/hooks/useGrid"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {useHotkeys} from "react-hotkeys-hook"
import {SpinnerDotted} from "spinners-react"
import {useResponsiveLayout} from "@/hooks/media/useResponsiveLayout"
import {cn} from "@/lib/utils"
import {Grid} from "@/components/Grid"
import {useSession} from "@/hooks/data/useSession"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useWidgets} from "@/hooks/data/useWidgets"
import {useSettings} from "@/hooks/data/useSettings"
import {toast} from "sonner"
import {WidgetRenderer} from "@/components/WidgetRenderer"
import {DashboardEmpty} from "@/components/empty/DashboardEmpty"

const LazyDashboardDialog = React.lazy(() => import("@/components/dialogs/DashboardDialog"))

export default function Dashboard() {
    const {userId, refetchSession, isLoading: sessionLoading} = useSession()
    const {settings, isLoading: settingsLoading, updateSettings} = useSettings(userId)
    const {dashboards, currentDashboard, isLoading: dashboardsLoading, addDashboard, addDashboardStatus} = useDashboards(userId, settings)
    const {widgets, isLoading: widgetsLoading, removeWidget, saveWidgetsLayout, updateWidgetPosition, setWidgets} = useWidgets(userId)

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const currentWidgets = useMemo(() => (
        widgets.filter((w) => w.dashboardId === currentDashboard?.id)
    ), [widgets, currentDashboard?.id])

    const widgetsMap = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets])
    // keep a stable ref to widgetsMap so handleEditModeDelete can be stable
    const widgetsMapRef = useRef(widgetsMap)
    useEffect(() => { widgetsMapRef.current = widgetsMap }, [widgetsMap])
    const widgetsToRemoveSet = useMemo(() => new Set(widgetsToRemove.map((widget) => widget.id)), [widgetsToRemove])
    const visibleWidgets = useMemo(() => (
        currentWidgets.filter((widget) => !widgetsToRemoveSet.has(widget.id))
    ), [currentWidgets, widgetsToRemoveSet])

    const gridCells = useGrid(activeWidget, visibleWidgets)
    const { sensors, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop(editMode, widgets, currentDashboard?.id ?? null, updateWidgetPosition, setActiveWidget)
    const { transformedWidgets, gridClasses, containerHeight, isDesktop } = useResponsiveLayout(visibleWidgets)

    const cachedWidgetsRef = useRef<Widget[] | null>(null)

    useEffect(() => {
        void refetchSession()
    }, [userId])

    useEffect(() => {
        if (!userId  || dashboardsLoading) return
        if (dashboards && dashboards.length === 0) setDialogOpen(true)
    }, [userId, dashboards, dashboardsLoading])

    const handleDashboardChange = useCallback(async (dashboardId: string | null) => {
      if (!settings) return
      await updateSettings({ ...settings, lastDashboardId: dashboardId })
    }, [settings, updateSettings])


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
            toast.success("Successfully updated your layout")
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setEditMode(false)
            setEditModeLoading(false)
            setWidgetsToRemove([])
            cachedWidgetsRef.current = null
        }
    }, [removeWidget, saveWidgetsLayout, widgetsToRemove])

    const handleEditModeCancel = useCallback(() => {
        if (cachedWidgetsRef.current) setWidgets(cachedWidgetsRef.current)
        setEditMode(false)
        setWidgetsToRemove([])
        cachedWidgetsRef.current = null
    }, [setWidgets])

    const handleEditModeDelete = useCallback((id: string) => {
        setWidgetsToRemove((prevWidgetsToRemove) => {
            if (prevWidgetsToRemove.some((widget) => widget.id === id)) return prevWidgetsToRemove
            const widget = widgetsMapRef.current.get(id)
            if (!widget) return prevWidgetsToRemove
            return [...prevWidgetsToRemove, widget]
        })
    }, [])

    useHotkeys("mod+e", (event) => {
        event.preventDefault()
        if (currentWidgets.length === 0) return
        if (!editMode) handleEditModeEnter()
    }, [editMode, currentWidgets, handleEditModeEnter])

    const dataLoading = useMemo(() => (
        sessionLoading || dashboardsLoading || widgetsLoading || settingsLoading
    ), [sessionLoading, dashboardsLoading, widgetsLoading, settingsLoading])

    return (
        <div className={cn("flex flex-col w-full h-full overflow-hidden", isDesktop && "max-h-screen max-w-screen")}>
            <Header
                onEdit={handleEditModeEnter}
                editMode={editMode}
                editModeLoading={editModeLoading}
                handleEditModeSave={handleEditModeSave}
                handleEditModeCancel={handleEditModeCancel}
                isLoading={dataLoading}
                widgetsEmpty={visibleWidgets.length === 0 && currentDashboard !== null}
                dashboards={dashboards ?? []}
                currentDashboard={currentDashboard}
                onDashboardChange={handleDashboardChange}
                addDashboard={addDashboard}
                addDashboardStatus={addDashboardStatus}
                userId={userId}
            />
            {dataLoading ? (
                <div className={"h-screen w-screen flex items-center justify-center"}>
                    <SpinnerDotted size={56} thickness={160} speed={100} color="rgba(237, 102, 49, 1)" />
                </div>
            ) : (
                <>
                    {visibleWidgets.length === 0 && currentDashboard ? (
                        <DashboardEmpty/>
                    ) : (
                        <>
                            {editMode ? (
                                <DndContext
                                    sensors={sensors}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                >
                                    <div className={cn("relative w-full", containerHeight, gridClasses)}>
                                        <Grid cells={gridCells} enabled={isDesktop}/>
                                        {transformedWidgets?.map((widget) => (
                                            <WidgetRenderer
                                                key={widget.id}
                                                widget={widget}
                                                editMode={editMode}
                                                onWidgetDelete={handleEditModeDelete}
                                                isDragging={activeWidget?.id === widget.id}
                                            />
                                        ))}
                                    </div>
                                </DndContext>
                            ) : (
                                <div className={cn("relative w-full", containerHeight, gridClasses)}>
                                    <Grid cells={gridCells} enabled={isDesktop}/>
                                    {transformedWidgets?.map((widget) => (
                                        <WidgetRenderer
                                            key={widget.id}
                                            widget={widget}
                                            editMode={editMode}
                                            onWidgetDelete={handleEditModeDelete}
                                            isDragging={activeWidget?.id === widget.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <Suspense fallback={null}>
                <LazyDashboardDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    showOnClose={false}
                    dashboards={dashboards}
                    addDashboard={addDashboard}
                    addDashboardStatus={addDashboardStatus}
                    userId={userId}
                />
            </Suspense>
        </div>
    )
}