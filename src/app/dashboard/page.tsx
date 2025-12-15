"use client"

import {Header} from "@/components/Header"
import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react"
import type {Widget} from "@/database"
import {useHotkeys} from "react-hotkeys-hook"
import {SpinnerDotted} from "spinners-react"
import {useResponsiveLayout} from "@/hooks/media/useResponsiveLayout"
import {cn} from "@/lib/utils"
import {useSession} from "@/hooks/data/useSession"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useWidgets} from "@/hooks/data/useWidgets"
import {useSettings} from "@/hooks/data/useSettings"
import {toast} from "sonner"
import {DashboardEmpty} from "@/components/empty/DashboardEmpty"
import {DashboardGrid} from "@/components/DashboardGrid"

const LazyDashboardDialog = React.lazy(() => import("@/components/dialogs/DashboardDialog"))

export default function Dashboard() {
    const {userId, isLoading: sessionLoading} = useSession()
    const {settings, isLoading: settingsLoading, updateSettings} = useSettings(userId)
    const {dashboards, currentDashboard, isLoading: dashboardsLoading, addDashboard, addDashboardStatus} = useDashboards(userId, settings)
    const {widgets, isLoading: widgetsLoading, removeWidget, saveWidgetsLayout, updateWidget, updateWidgetPosition, setWidgets} = useWidgets(userId)

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const currentDashboardId = currentDashboard?.id ?? null
    const currentWidgets = useMemo(() => widgets.filter((widget) => widget.dashboardId === currentDashboardId), [widgets, currentDashboardId])
    const widgetsToRemoveSet = useMemo(() => new Set(widgetsToRemove.map((widget) => widget.id)), [widgetsToRemove])
    const visibleWidgets = useMemo(() => currentWidgets.filter((widget) => !widgetsToRemoveSet.has(widget.id)), [currentWidgets, widgetsToRemoveSet])

    const {isDesktop} = useResponsiveLayout(visibleWidgets)

    const cachedWidgetsRef = useRef<Widget[] | null>(null)
    const currentWidgetsRef = useRef<Widget[]>([])

    useEffect(() => {
        currentWidgetsRef.current = currentWidgets
    }, [currentWidgets])

    useEffect(() => {
        if (!userId || dashboardsLoading) return
        if (dashboards && dashboards.length === 0) {
            const timer = setTimeout(() => setDialogOpen(true), 500)
            return () => clearTimeout(timer)
        }
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
            const widget = currentWidgetsRef.current.find((candidate) => candidate.id === id)
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
            ) : (visibleWidgets.length === 0 && currentDashboard ? (
                <DashboardEmpty/>
            ) : (
                <DashboardGrid
                    editMode={editMode}
                    activeWidgetId={activeWidget?.id ?? null}
                    onWidgetDelete={handleEditModeDelete}
                    onWidgetUpdate={updateWidget}
                    currentDashboardId={currentDashboardId}
                    currentWidgets={currentWidgets}
                    updateWidgetPosition={updateWidgetPosition}
                    visibleWidgets={visibleWidgets}
                    activeWidget={activeWidget}
                    setActiveWidget={setActiveWidget}
                />
            ))}
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