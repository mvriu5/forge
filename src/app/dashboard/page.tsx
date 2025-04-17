"use client"

import {Header} from "@/components/Header"
import React, {memo, useCallback, useRef} from "react"
import {useEffect, useState} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent} from "@/lib/widgetRegistry"
import {useIntegrationStore} from "@/store/integrationStore"
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import type {Widget} from "@/database"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {EmptyAddSVG} from "@/components/svg/EmptyAddSVG"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {Blocks, CloudAlert} from "lucide-react"
import { Skeleton } from "@/components/ui/Skeleton"
import { Button } from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import { useShallow } from "zustand/react/shallow"

export default function Dashboard() {
    const {session, fetchSession} = useSessionStore()
    const {
        widgets,
        getAllWidgets,
        updateWidgetPosition,
        removeWidget,
        resetWidgets,
        saveWidgetsLayout
    } = useWidgetStore()
    const { fetchIntegrations } = useIntegrationStore()
    const { addToast } = useToast()

    const [gridCells, setGridCells] = useState<{ x: number; y: number; isDroppable: boolean }[]>([])
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgetsToRemove, setWidgetsToRemove] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [editModeLoading, setEditModeLoading] = useState<boolean>(false)

    const cachedWidgetsRef = useRef<Widget[] | null>(null)

    const widgetIds = useWidgetStore(useShallow((s) => s.widgets?.map((w) => w.id)))

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    useEffect(() => {
        setLoading(true)
        fetchSession()
    }, [fetchSession])

    useEffect(() => {
        if (session?.user) {
            getAllWidgets(session.user.id)
            fetchIntegrations(session.user.id)
            setLoading(false)
        }
    }, [session, getAllWidgets, fetchIntegrations])

    const getOccupiedCells = () => {
        const occupiedCells: Record<string, boolean> = {}

        widgets?.map((widget) => {
            if (activeWidget && widget.id === activeWidget.id) return

            const { width, height, positionX, positionY } = widget

            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    occupiedCells[`${positionX + i},${positionY + j}`] = true
                }
            }
        })

        return occupiedCells
    }

    const canPlaceWidget = (widget: { width: number; height: number }, x: number, y: number) => {
        const { width, height } = widget
        const occupiedCells = getOccupiedCells()

        if (x + width > 4 || y + height > 4) {
            return false
        }

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const cellKey = `${x + i},${y + j}`
                if (occupiedCells[cellKey]) {
                    return false
                }
            }
        }

        return true
    }

    useEffect(() => {
        const cells = []
        const occupiedCells = getOccupiedCells()

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const isOccupied = occupiedCells[`${x},${y}`]
                let isDroppable = false

                if (activeWidget && !isOccupied) {
                    isDroppable = canPlaceWidget(activeWidget, x, y)
                }

                cells.push({ x, y, isDroppable })
            }
        }

        setGridCells(cells)
    }, [activeWidget, widgets])

    const handleDragStart = (event: DragStartEvent) => {
        if (!editMode) return

        const { active } = event
        const activeWidgetData = widgets?.find((w) => w.id === active.id)
        if (activeWidgetData) {
            setActiveWidget(activeWidgetData)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        if (!editMode) return

        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }

            updateWidgetPosition(active.id as string, x, y)
        }

        setActiveWidget(null)
    }

    const handleEditModeEnter = useCallback(() => {
        setEditMode(true)
        cachedWidgetsRef.current = useWidgetStore.getState().widgets
    }, [])

    const handleEditModeSave = useCallback(async () => {
        try {
            setEditModeLoading(true)
            if (!widgets) return

            if (widgetsToRemove)
                await Promise.all(widgetsToRemove.map((widget) => removeWidget(widget)))

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
        }
    }, [widgetsToRemove, removeWidget, saveWidgetsLayout, addToast])

    const handleEditModeCancel = useCallback(() => {
        if (cachedWidgetsRef.current) resetWidgets(cachedWidgetsRef.current)
        setEditMode(false)
        setWidgetsToRemove([])
    }, [resetWidgets])

    const handleEditModeDelete = useCallback((id: string) => {
        const widget = useWidgetStore.getState().widgets?.find(w => w.id === id)
        if (widget) setWidgetsToRemove((w) => [...w, widget])
    }, [])

    if (loading) {
        return (
            <div className={"flex flex-col w-full h-full"}>
                <Header onEdit={handleEditModeEnter} editMode={editMode}/>
                <div
                    className={"grid gird-cols-4 gap-8 p-8 h-[calc(100vh-64px)] w-full"}
                    style={{ gridTemplateRows: "repeat(4, minmax(0, 1fr))" }}
                >
                    <Skeleton className={"col-span-3 row-span-1 dark:bg-tertiary rounded-md"}/>
                    <Skeleton className={"col-span-2 row-span-2 dark:bg-tertiary rounded-md"}/>
                    <Skeleton className={"col-span-1 row-span-2 dark:bg-tertiary rounded-md"}/>
                    <Skeleton className={"col-span-1 row-span-1 dark:bg-tertiary rounded-md"}/>
                    <Skeleton className={"col-span-2 row-span-1 dark:bg-tertiary rounded-md"}/>
                </div>
            </div>
        )
    }

    if (widgets?.length === 0) {
        return (
            <div className={"flex flex-col w-full h-screen"}>
                <Header onEdit={handleEditModeEnter} editMode={editMode} widgetsEmpty={true}/>
                <div className={"w-full h-full flex items-center justify-center"}>
                    <div className={"flex flex-col gap-4 items-center justify-center p-12 border border-main border-dashed rounded-md shadow-xl"}>
                        <EmptyAddSVG/>
                        <p className={"w-80 text-center text-sm"}>You dont have any widgets in your dashboard. Add a new widget, by visiting the widget store.</p>
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
                <div
                    className="relative w-full h-[calc(100vh-64px)] grid grid-cols-4 gap-8 p-8"
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
        </div>
    )
}

interface WidgetProps {
    id: string
    onDelete: (id: string) => void
    editMode: boolean
}

const Widget = ({ id, onDelete, editMode }: WidgetProps) => {
    const widget = useWidgetStore(useShallow((s) => s.widgets?.find((w) => w.id === id)!))
    const Component = getWidgetComponent(widget.widgetType)
    const handleDelete = useCallback(() => onDelete(id), [onDelete, id])
    if (!Component) return null
    return <Component key={widget.id} id={widget.id} editMode={editMode} onWidgetDelete={handleDelete} />
}

const MemoizedWidget = memo(Widget, (prev, next) => prev.id === next.id && prev.onDelete === next.onDelete && prev.editMode === next.editMode)

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
            className={`min-h-[180px] rounded-md border-2 ${
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
