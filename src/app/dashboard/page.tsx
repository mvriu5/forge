"use client"

import {Header} from "@/components/Header"
import React, {memo, useCallback, useEffect, useState, useRef} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent} from "@/lib/widgetRegistry"
import {useIntegrationStore} from "@/store/integrationStore"
import {DndContext, useDroppable} from "@dnd-kit/core"
import type {Widget} from "@/database"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {EmptyAddSVG} from "@/components/svg/EmptyAddSVG"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {Blocks, CloudAlert} from "lucide-react"
import { Button } from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import { useShallow } from "zustand/react/shallow"
import {useGrid} from "@/hooks/useGrid"
import {useDragAndDrop} from "@/hooks/useDragAndDrop"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import { Callout } from "@/components/ui/Callout"
import {useDashboardStore} from "@/store/dashboardStore"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"

export default function Dashboard() {
    const { session, fetchSession } = useSessionStore()
    const { dashboards, currentDashboard, getAllDashboards } = useDashboardStore()
    const { widgets, getAllWidgets, removeWidget, saveWidgetsLayout } = useWidgetStore()
    const { fetchIntegrations } = useIntegrationStore()
    const { addToast } = useToast()

    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)

    const gridCells = useGrid(activeWidget)
    const { sensors, handleDragStart, handleDragEnd } = useDragAndDrop(editMode, setActiveWidget)

    const cachedWidgetsRef = useRef<Widget[] | null>(null)

    //logik für dashboard wechsel (cachedWidgets etc)

    const widgetIds = useWidgetStore(useShallow((s) => s.widgets?.filter((w) => w.dashboardId == currentDashboard?.id).map((w) => w.id)))

    useEffect(() => {
        setLoading(true)
        fetchSession()
    }, [fetchSession])

    useEffect(() => {
        if (session?.user) {
            getAllDashboards(session.user.id).then(() => {
                if (dashboards) useDashboardStore.setState({ currentDashboard: dashboards[0] })
            })
            getAllWidgets(session.user.id)
            fetchIntegrations(session.user.id)
            setLoading(false)

        }
    }, [session, getAllWidgets, fetchIntegrations])


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
                <Header onEdit={handleEditModeEnter} editMode={editMode}/>
                <div className={"h-full w-full flex items-center justify-center"}>
                    <div className={"animate-spin"}>
                        <ForgeLogo size={56}/>
                    </div>
                </div>
            </div>
        )
    }

    if (widgets?.length === 0) {
        return (
            <div className={"flex flex-col w-full h-screen"}>
                <Header onEdit={handleEditModeEnter} editMode={editMode} widgetsEmpty={true}/>
                <div className={"w-full h-full flex items-center justify-center"}>
                    <div className={"flex flex-col gap-4 items-center justify-center p-4 md:p-12 border border-main border-dashed rounded-md shadow-xl"}>
                        <EmptyAddSVG/>
                        <p className={"w-56 md:w-80 text-center text-sm"}>You dont have any widgets in your dashboard. Add a new widget, by visiting the widget store.</p>
                        <WidgetDialog editMode={false} title={"Widget-Store"}/>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={"flex flex-col w-full h-full max-h-screen max-w-screen overflow-hidden"}>
            <Header onEdit={handleEditModeEnter} editMode={editMode}/>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={"flex h-screen xl:hidden items-center justify-center"}>
                    <Callout variant={"info"} className={"border border-info/20 shadow-lg"}>
                        The browser window is to small to render your widgets!
                    </Callout>
                </div>
                <div
                    className="relative w-full h-[calc(100vh-64px)] hidden xl:grid grid-cols-4 gap-8 p-8"
                    style={{ gridTemplateRows: "repeat(4, minmax(0, 1fr))" }}
                >
                    {gridCells.map((cell) => (
                        <GridCell key={`${cell.x},${cell.y}`} x={cell.x} y={cell.y} isDroppable={cell.isDroppable} />
                    ))}

                    {widgetIds
                        ?.filter((id) => !widgetsToRemove?.some((w) => w.id === id))
                        .map((id) => <MemoizedWidget key={id} id={id} editMode={editMode} onDelete={handleEditModeDelete} />
                    )}
                </div>
            </DndContext>
            {editMode &&
                <div className={"px-8 py-2.5 z-50 fixed flex items-center gap-4 bg-primary rounded-md bottom-2 left-1/2 transform -translate-x-1/2 shadow-xl border border-main/40"}>
                    <Button onClick={handleEditModeCancel} className={"px-6 bg-secondary border-main/60"}>
                        Cancel
                    </Button>
                    <Button variant="brand" onClick={handleEditModeSave} className={"px-6"}>
                        {editModeLoading && <ButtonSpinner/>}
                        Save
                    </Button>
                </div>
            }
            {!currentDashboard && !loading &&
                <DashboardDialog open={true} showOnClose={false}/>
            }
        </div>
    )
}

interface WidgetProps {
    id: string
    onDelete: (id: string) => void
    editMode: boolean
}

const WidgetComponent = ({ id, onDelete, editMode }: WidgetProps) => {
    const widget = useWidgetStore(useShallow((s) => s.widgets?.find((w) => w.id === id)!))
    const Component = getWidgetComponent(widget.widgetType)
    const handleDelete = useCallback(() => onDelete(id), [onDelete, id])
    if (!Component) return null
    return <Component key={widget.id} id={widget.id} editMode={editMode} onWidgetDelete={handleDelete} />
}

const MemoizedWidget = memo(WidgetComponent, (prev, next) => prev.id === next.id && prev.onDelete === next.onDelete && prev.editMode === next.editMode)

interface GridCellProps {
    x: number
    y: number
    isDroppable: boolean
}

const GridCell = ({ x, y, isDroppable }: GridCellProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: {x, y},
        disabled: !isDroppable
    })

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[160px] rounded-md border-2 ${
                isDroppable
                    ? isOver
                        ? "border-dashed border-main bg-tertiary"
                        : "border-dashed border-main/50"
                    : "border-transparent"
            }`}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
            }}
        />
    )
}
