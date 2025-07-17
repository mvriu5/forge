"use client"

import {Header} from "@/components/Header"
import React, {memo, useCallback, useEffect, useRef, useState} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent} from "@/lib/widgetRegistry"
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
import {Callout} from "@/components/ui/Callout"
import {useDashboardStore} from "@/store/dashboardStore"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"
import {useHotkeys} from "react-hotkeys-hook"
import {SpinnerDotted} from "spinners-react"
import {useSettingsStore} from "@/store/settingsStore"

export default function Dashboard() {
    const { session, fetchSession } = useSessionStore()
    const { currentDashboard, getAllDashboards } = useDashboardStore()
    const { widgets, getAllWidgets, removeWidget, saveWidgetsLayout } = useWidgetStore()
    const { fetchIntegrations } = useIntegrationStore()
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

    const findFreePosition = (width: number, height: number, excludeId?: string) => {
        const occupiedCells: Record<string, boolean> = {}

        // Mark all occupied cells
        widgets?.map((widget) => {
            if (excludeId && (widget.id === excludeId || widget.widgetType === excludeId)) return

            for (let i = 0; i < widget.width; i++) {
                for (let j = 0; j < widget.height; j++) {
                    occupiedCells[`${widget.positionX + i},${widget.positionY + j}`] = true
                }
            }
        })

        // Find first free position
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

                if (canPlace) {
                    return { x, y }
                }
            }
        }

        return { x: 0, y: 0 } // Fallback
    }

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

    if (loading) {
        return (
            <div className={"flex flex-col w-screen h-screen"}>
                <Header
                    onEdit={handleEditModeEnter}
                    handleEditModeSave={handleEditModeSave}
                    handleEditModeCancel={handleEditModeCancel}
                    editMode={editMode}
                    isLoading={true}
                />
                <div className={"h-full w-full flex items-center justify-center"}>
                    <SpinnerDotted size={56} thickness={160} speed={100} color="rgba(237, 102, 49, 1)" />
                </div>
                <DashboardDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    showOnClose={false}
                />
            </div>
        )
    }

    if (widgets?.filter((w) => w.dashboardId === currentDashboard?.id).length === 0 && currentDashboard) {
        return (
            <div className={"flex flex-col w-full h-screen"}>
                <Header onEdit={handleEditModeEnter} editMode={editMode} widgetsEmpty={true}/>
                <div className={"w-full h-full flex items-center justify-center"}>
                    <div className={"flex flex-col gap-4 items-center justify-center p-4 md:p-12 border border-main border-dashed rounded-md shadow-md dark:shadow-xl"}>
                        <EmptyAddSVG/>
                        <p className={"w-56 md:w-80 text-center text-sm"}>You dont have any widgets in your dashboard. Add a new widget, by visiting the widget store.</p>
                        <WidgetDialog editMode={false} title={"Widget-Store"}/>
                    </div>
                </div>
                <DashboardDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    showOnClose={false}
                />
            </div>
        )
    }

    return (
        <div className={"flex flex-col w-full h-full max-h-screen max-w-screen overflow-hidden"}>
            <Header
                onEdit={handleEditModeEnter}
                editMode={editMode}
                editModeLoading={editModeLoading}
                handleEditModeSave={handleEditModeSave}
                handleEditModeCancel={handleEditModeCancel}
            />
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className={"flex h-screen xl:hidden items-center justify-center"}>
                    <Callout variant={"info"} className={"border border-info/20 shadow-lg"}>
                        The browser window is to small to render your widgets!
                    </Callout>
                </div>
                <div
                    className="relative w-full h-[calc(100vh-48px)] hidden xl:grid grid-cols-4 gap-4 p-4"
                    style={{ gridTemplateRows: "repeat(4, minmax(0, 1fr))" }}
                >
                    {gridCells?.map((cell) => (
                        <GridCell
                            key={`${cell.x},${cell.y}`}
                            x={cell.x}
                            y={cell.y}
                            width={cell.width}
                            height={cell.height}
                            isDroppable={cell.isDroppable}
                        />
                    ))}

                    {currentWidgets
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
    const Component = getWidgetComponent(widget.widgetType)
    const handleDelete = useCallback(() => onDelete(widget.id), [onDelete, widget.id])
    if (!Component) return null

    return (
        <div
            className={`transition-opacity duration-200 ${isDragging ? "opacity-50" : "opacity-100"}`}
            style={{
                gridColumnStart: widget.positionX + 1,
                gridRowStart: widget.positionY + 1,
                gridColumnEnd: widget.positionX + 1 + widget.width,
                gridRowEnd: widget.positionY + 1 + widget.height,
            }}
        >
            <Component key={widget.id} id={widget.id} editMode={editMode} onWidgetDelete={handleDelete} />
        </div>
    )
}

const MemoizedWidget = memo(WidgetComponent, (prev, next) =>
    prev.widget.id === next.widget.id &&
    prev.widget.positionX === next.widget.positionX &&
    prev.widget.positionY === next.widget.positionY &&
    prev.widget.height === next.widget.height &&
    prev.widget.width === next.widget.width &&
    prev.onDelete === next.onDelete &&
    prev.editMode === next.editMode &&
    prev.isDragging === next.isDragging
)

interface GridCellProps {
    x: number
    y: number
    width: number
    height: number
    isDroppable: boolean
}

const GridCell = ({ x, y, width, height, isDroppable }: GridCellProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: {x, y},
        disabled: !isDroppable
    })

    return (
        <div
            ref={setNodeRef}
            className={`rounded-md border-2 ${
                isDroppable && isOver
                    ? "border-dashed border-main bg-tertiary"
                    : "border-transparent"
            }`}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
                gridColumnEnd: x + 1 + width,
                gridRowEnd: y + 1 + height,
                minHeight: `${height * 180}px`,
            }}
        />
    )
}
