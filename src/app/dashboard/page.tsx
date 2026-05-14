"use client"

import { DashboardGrid } from "@/components/DashboardGrid"
import { DashboardEmpty } from "@/components/empty/DashboardEmpty"
import { Header } from "@/components/Header"
import { Providers } from "@/components/Providers"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import type { Widget } from "@/database"
import { useDashboards } from "@/hooks/data/useDashboards"
import { useSettings } from "@/hooks/data/useSettings"
import { IntegrationsProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useWidgets } from "@/hooks/data/useWidgets"
import { useBreakpoint } from "@/hooks/media/useBreakpoint"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"

const LazyDashboardDialog = React.lazy(() => import("@/components/dialogs/DashboardDialog"))
const LazyOnboardingDialog = React.lazy(() => import("@/components/dialogs/OnboardingDialog"))

function DashboardContent() {
    const {data: session, isPending: sessionLoading} = authClient.useSession()
    const {settings, isLoading: settingsLoading, updateSettings} = useSettings(session?.user.id)
    const {dashboards, currentDashboard, isLoading: dashboardsLoading, addDashboard, addDashboardStatus,setSelectedDashboard} = useDashboards(session?.user.id, settings)
    const integrations = useIntegrations(session?.user.id)
    const {widgets, isLoading: widgetsLoading, isReady: widgetsReady, removeWidget, saveWidgetsLayout, updateWidget, updateWidgetPosition, setWidgets} = useWidgets(session?.user.id)

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [onboardingOpen, setOnboardingOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const currentDashboardId = currentDashboard?.id ?? null
    const currentWidgets = useMemo(() => widgets.filter((widget) => widget.dashboardId === currentDashboardId), [widgets, currentDashboardId])
    const widgetsToRemoveIds = useMemo(() => new Set(widgetsToRemove.map((widget) => widget.id)), [widgetsToRemove])
    const visibleWidgets = useMemo(() => currentWidgets.filter((widget) => !widgetsToRemoveIds.has(widget.id)), [currentWidgets, widgetsToRemoveIds])

    const {breakpoint} = useBreakpoint()
    const isDesktop = breakpoint === "desktop"

    const cachedWidgetsRef = useRef<Widget[] | null>(null)
    const currentWidgetsRef = useRef<Widget[]>([])

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen()
        else if (document.exitFullscreen) document.exitFullscreen()
    }

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, [])

    useEffect(() => {
        currentWidgetsRef.current = currentWidgets
    }, [currentWidgets])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!session?.user.id || dashboardsLoading || settingsLoading || !settings) return
        if (!settings.onboardingCompleted) {
            const timer = setTimeout(() => setOnboardingOpen(true), 500)
            return () => clearTimeout(timer)
        }
        if (dashboards && dashboards.length === 0) {
            const timer = setTimeout(() => setDialogOpen(true), 500)
            return () => clearTimeout(timer)
        }
    }, [session?.user.id, dashboards, dashboardsLoading, settings, settingsLoading])

    const handleOnboardingComplete = useCallback(async () => {
        if (!settings) return

        await updateSettings({
            ...settings,
            onboardingCompleted: true
        })
        if (dashboards && dashboards.length === 0) {
            setTimeout(() => setDialogOpen(true), 300)
        }
    }, [settings, updateSettings, dashboards])

    const handleDashboardChange = useCallback(async (dashboardId: string | null) => {
        if (!settings) return
        setSelectedDashboard(dashboardId)
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
            const removedWidgetIds = new Set(widgetsToRemove.map((widget) => widget.id))
            const cachedWidgets = cachedWidgetsRef.current ?? []
            const cachedById = new Map(cachedWidgets.map((widget) => [widget.id, widget]))
            const dirtyWidgets = widgets.filter((widget) => {
                if (removedWidgetIds.has(widget.id)) return false
                const cached = cachedById.get(widget.id)
                return !cached
                    || cached.width !== widget.width
                    || cached.height !== widget.height
                    || cached.positionX !== widget.positionX
                    || cached.positionY !== widget.positionY
            })
            await saveWidgetsLayout(dirtyWidgets)
            toast.success("Successfully updated your layout.")
        } catch (error) {
            console.log(error)
            toast.error("Something went wrong.")
        } finally {
            setEditMode(false)
            setEditModeLoading(false)
            setWidgetsToRemove([])
            cachedWidgetsRef.current = null
        }
    }, [removeWidget, saveWidgetsLayout, widgets, widgetsToRemove])

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
        <IntegrationsProvider value={integrations}>
        <div className={cn("flex flex-col w-full h-full", isDesktop && "max-h-screen max-w-screen overflow-hidden")}>
            {mounted ? (
                <Header
                    onEdit={handleEditModeEnter}
                    editMode={editMode}
                    editModeLoading={editModeLoading}
                    handleEditModeSave={handleEditModeSave}
                    handleEditModeCancel={handleEditModeCancel}
                    isLoading={dataLoading}
                    isOnboarding={onboardingOpen}
                    widgetsEmpty={visibleWidgets.length === 0 && currentDashboard !== null}
                    dashboards={dashboards ?? []}
                    currentDashboard={currentDashboard}
                    onDashboardChange={handleDashboardChange}
                    addDashboard={addDashboard}
                    addDashboardStatus={addDashboardStatus}
                    userId={session?.user.id}
                    isFullscreen={isFullscreen}
                    toggleFullScreen={toggleFullScreen}
                />
            ) :(
                <div className="h-12 w-full border-b border-main/40" />
            )}
            <main className={cn("h-screen w-full", mounted && !isFullscreen && "pt-12")}>
                {dataLoading && visibleWidgets.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full text-tertiary gap-2">
                        <Spinner size={24}/>
                        <span className="text-sm font-medium">Widgets loading...</span>
                    </div>
                ) : visibleWidgets.length === 0 && currentDashboard && !editMode && widgetsReady ? (
                    <DashboardEmpty/>
                ) : (
                    <DashboardGrid
                        editMode={editMode}
                        activeWidgetId={activeWidget?.id ?? null}
                        currentDashboardId={currentDashboardId}
                        widgets={visibleWidgets}
                        activeWidget={activeWidget}
                        setActiveWidget={setActiveWidget}
                        updateWidgetPosition={updateWidgetPosition}
                        onWidgetDelete={handleEditModeDelete}
                        onWidgetUpdate={updateWidget}
                        isFullscreen={isFullscreen}
                    />
                )}
            </main>
            <Suspense fallback={null}>
                <LazyDashboardDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    showOnClose={false}
                    dashboards={dashboards}
                    addDashboard={addDashboard}
                    addDashboardStatus={addDashboardStatus}
                    userId={session?.user.id}
                />
            </Suspense>
            <Suspense fallback={null}>
                <LazyOnboardingDialog
                    open={onboardingOpen}
                    onOpenChange={setOnboardingOpen}
                    onComplete={handleOnboardingComplete}
                />
            </Suspense>
        </div>
        </IntegrationsProvider>
    )
}

export default function DashboardPage() {
    return (
        <Providers>
            <DashboardContent />
        </Providers>
    )
}
