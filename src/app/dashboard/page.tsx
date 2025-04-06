"use client"

import {Header} from "@/components/Header"
import {Button, ToastProvider, TooltipProvider} from "lunalabs-ui"
import type React from "react"
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
    TouchSensor, useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import type { Widget } from "@/database"
import {ButtonSpinner} from "@/components/ButtonSpinner"

export default function Dashboard() {
    const {session, fetchSession} = useSessionStore()
    const {widgets, getAllWidgets, updateWidgetPosition} = useWidgetStore()
    const {fetchIntegrations} = useIntegrationStore()
    //const {addToast} = useToast()

    const [gridCells, setGridCells] = useState<{ x: number; y: number; isDroppable: boolean }[]>([])
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [cachedWidgets, setCachedWidgets] = useState<Widget[]>([])
    const [editMode, setEditMode] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

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
        fetchSession()
    }, [fetchSession])

    useEffect(() => {
        if (session?.user) {
            getAllWidgets(session.user.id)
            fetchIntegrations(session.user.id)
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

    const handleEditModeEnter = () => {
        setEditMode(true)
        setCachedWidgets(widgets ? [...widgets] : [])
    }

    const handleEditModeSave = async () => {
        try {
            setLoading(true)
            if (!widgets) return;

            const updatePromises = widgets.map(async (widget) => {
                const response = await fetch('/api/widgets', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(widget),
                });

                if (!response.ok) throw new Error(`Fehler beim Aktualisieren von Widget ${widget.id}`)

                return response.json();
            })

            const results = await Promise.all(updatePromises)

            /*addToast({
                title: "Successfully updated your layout",
                icon: <Blocks size={24} className={"text-brand"}/>
            })*/
        } catch (error) {
            /*addToast({
                title: "An error occurred",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })*/
        } finally {
            setEditMode(false)
            setLoading(false)
        }
    }

    const handleEditModeCancel = () => {
        setEditMode(false)
        cachedWidgets.map(widget => {
            updateWidgetPosition(widget.id, widget.positionX, widget.positionY)
        })
    }

    return (
        <TooltipProvider>
            <ToastProvider>
                <div className={"flex flex-col w-full h-full"}>
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

                            {widgets?.map((widget) => {
                                const Component = getWidgetComponent(widget.widgetType)
                                if (!Component) return null
                                return <Component key={widget.id} name={widget.widgetType} editMode={editMode}/>
                            })}
                        </div>
                    </DndContext>
                    {editMode &&
                        <div className={"px-12 py-2 z-50 fixed flex items-center gap-4 bg-primary rounded-xl bottom-2 left-1/2 transform -translate-x-1/2 shadow-xl border border-main/40"}>
                            <Button onClick={handleEditModeCancel} className={"px-6"}>
                                Cancel
                            </Button>
                            <Button variant="brand" onClick={handleEditModeSave} className={"px-6"}>
                                {loading && <ButtonSpinner/>}
                                Save
                            </Button>
                        </div>
                    }
                </div>
            </ToastProvider>
        </TooltipProvider>
    )
}

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