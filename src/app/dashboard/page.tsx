"use client"

import {Header} from "@/components/Header"
import {ToastProvider, TooltipProvider} from "lunalabs-ui"
import React, {ReactNode, useEffect, useState} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent} from "@/lib/widget"
import {useIntegrationStore} from "@/store/integrationStore"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {GridCell} from "@/components/GridCell"
import { Widget } from "@/database"

export default function Dashboard() {
    const {session, fetchSession} = useSessionStore()
    const {widgets, getAllWidgets} = useWidgetStore()
    const {fetchIntegrations} = useIntegrationStore()

    const [gridCells, setGridCells] = useState<{ x: number; y: number; isDroppable: boolean }[]>([])
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)

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
        }),
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

        widgets?.forEach((widget) => {
            if (activeWidget && widget.id === activeWidget.id) return

            for (let i = 0; i < widget.width; i++) {
                for (let j = 0; j < widget.height; j++) {
                    occupiedCells[`${widget.positionX + i},${widget.positionY + j}`] = true
                }
            }
        })

        return occupiedCells
    }

    const canPlaceWidget = (widget: Widget, x: number, y: number) => {
        const occupiedCells = getOccupiedCells()

        if (x + widget.width > 4 || y + widget.height > 4) {
            return false
        }

        for (let i = 0; i < widget.width; i++) {
            for (let j = 0; j < widget.height; j++) {
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
        const { active } = event
        const activeWidgetData = widgets?.find((w) => w.id === active.id)
        if (activeWidgetData) {
            setActiveWidget(activeWidgetData)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const { x, y } = over.data.current as { x: number; y: number }

            setWidgets((widgets) => {
                return widgets.map((widget) => {
                    if (widget.id === active.id) {
                        return {
                            ...widget,
                            gridPosition: { x, y },
                        }
                    }
                    return widget
                })
            })
        }

        setActiveWidget(null)
    }

    return (
        <TooltipProvider>
            <ToastProvider>
                <div className={"flex flex-col w-full h-full"}>
                    <Header />
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className={"w-full h-full grid grid-cols-4 auto-rows-[minmax(180px,180px)] gap-8 p-8"}>
                            {gridCells.map((cell) => (
                                <GridCell key={`${cell.x},${cell.y}`} x={cell.x} y={cell.y} isDroppable={cell.isDroppable} />
                            ))}

                            {widgets?.map((widget) => {
                                const Component = getWidgetComponent(widget.widgetType)
                                if (!Component) return null
                                return <Component key={widget.widgetType} />
                            })}
                        </div>

                        <DragOverlay>
                            {activeWidget ? (
                                <div className={`col-span-[${activeWidget.width}] row-span-[${activeWidget.height}] opacity-80`}>
                                    <div className="h-full w-full rounded-lg border border-primary bg-card p-4 shadow-lg ring-2 ring-primary">
                                        {getWidgetComponent(activeWidget.widgetType) as ReactNode || null}
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </ToastProvider>
        </TooltipProvider>
    )
}