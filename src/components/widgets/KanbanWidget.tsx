"use client"

import React, { useState } from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Button} from "@/components/ui/Button"
import {Forward, Plus, Trash} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {tooltip} from "@/components/ui/TooltipProvider"
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    KeyboardSensor, MouseSensor,
    PointerSensor, TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import { Input } from "../ui/Input"
import {useWidgetStore} from "@/store/widgetStore"
import {useDashboardStore} from "@/store/dashboardStore"

export type Card = {
    id: string
    title: string
}

type Column = {
    id: string
    title: string
    cards: Card[]
}

const KanbanWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {}

    const {getWidget, refreshWidget} = useWidgetStore()

    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "kanban")
    if (!widget) return

    const [columns, setColumns] = useState<Column[]>(widget.config?.kanban ?? [])
    const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    )

    const addColumnTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new column",
        anchor: "tc"
    })

    const formSchema = z.object({
        title: z.string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        },
    })

    const updateWidgetConfig = async () => {
        await refreshWidget({
            ...widget,
            config: {
                kanban: columns,
            },
        })
    }

    const handleAddColumn = (column: Partial<Column>) => {
        if (column.title?.trim()) {
            const newColumn: Column = {
                id: `column-${crypto.randomUUID()}`,
                title: column.title?.trim(),
                cards: [],
            }
            setColumns((prev) => [...prev, newColumn])

            updateWidgetConfig()

            setColumnPopoverOpen(false)
            form.reset()
        }
    }

    const handleColumnDelete = (columnId: string) => {
        setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId))
        updateWidgetConfig()
    }

    const handleCardDelete = (cardId: string) => {
        setColumns((prevColumns) =>
            prevColumns.map((col) => ({
                ...col,
                cards: col.cards.filter((card) => card.id !== cardId),
            })),
        )
        updateWidgetConfig()
    }

    const handleAddCardToColumn = (columnId: string, title: string) => {
        const newCard: Card = {
            id: `card-${crypto.randomUUID()}`,
            title
        }
        setColumns((prevColumns) =>
            prevColumns.map((col) => (col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col)),
        )

        updateWidgetConfig()
    }

    const findColumn = (id: string) => {
        if (id.startsWith("column-")) {
            return columns.find((col) => col.id === id)
        }
        const column = columns.find((col) => col.cards.some((card) => card.id === id))
        return column
    }

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const activeContainer = findColumn(active.id as string)
        const overContainer = findColumn(over.id as string)

        if (!activeContainer || !overContainer || activeContainer.id === overContainer.id) return

        if (active.id.toString().startsWith("card-")) {
            setColumns((prevColumns) => {
                const newColumns = [...prevColumns]

                const activeColumnIndex = newColumns.findIndex((col) => col.id === activeContainer.id)
                const overColumnIndex = newColumns.findIndex((col) => col.id === overContainer.id)

                if (activeColumnIndex === -1 || overColumnIndex === -1) {
                    return prevColumns
                }

                const activeCardIndex = newColumns[activeColumnIndex].cards.findIndex((card) => card.id === active.id)
                if (activeCardIndex === -1) {
                    return prevColumns
                }

                // Remove card from source column
                const [movedCard] = newColumns[activeColumnIndex].cards.splice(activeCardIndex, 1)

                // Add card to destination column
                let newCardIndex: number
                if (over.id.toString().startsWith("card-")) {
                    // Find the index of the card we are hovering over in the destination column
                    newCardIndex = newColumns[overColumnIndex].cards.findIndex((card) => card.id === over.id)
                    if (newCardIndex === -1) {
                        // Fallback if over card not found (shouldn't happen if collision detection is good)
                        newCardIndex = newColumns[overColumnIndex].cards.length
                    }
                } else {
                    // over.id is a column, drop at the end
                    newCardIndex = newColumns[overColumnIndex].cards.length
                }

                newColumns[overColumnIndex].cards.splice(newCardIndex, 0, movedCard)

                return newColumns
            })
        }
    }

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over || active.id === over.id) {
            return
        }

        const activeContainer = findColumn(active.id as string)
        const overContainer = findColumn(over.id as string)

        if (!activeContainer || !overContainer) {
            return
        }

        const isDraggingColumn = active.id.toString().startsWith("column-")
        const isDraggingCard = active.id.toString().startsWith("card-")

        // Reordering columns
        if (isDraggingColumn && activeContainer.id !== overContainer.id) {
            const oldIndex = columns.findIndex((col) => col.id === active.id)
            const newIndex = columns.findIndex((col) => col.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                setColumns((prev) => arrayMove(prev, oldIndex, newIndex))
            }
        }
        // Reordering cards within the same column
        else if (isDraggingCard && activeContainer.id === overContainer.id) {
            setColumns((prevColumns) => {
                const newColumns = [...prevColumns]
                const columnIndex = newColumns.findIndex((col) => col.id === activeContainer.id)

                if (columnIndex === -1) {
                    return prevColumns
                }

                const oldCardIndex = newColumns[columnIndex].cards.findIndex((card) => card.id === active.id)
                const newCardIndex = newColumns[columnIndex].cards.findIndex((card) => card.id === over.id)

                if (oldCardIndex !== -1 && newCardIndex !== -1) {
                    newColumns[columnIndex].cards = arrayMove(newColumns[columnIndex].cards, oldCardIndex, newCardIndex)
                }
                return newColumns
            })
        }
    }

    return (
        <WidgetTemplate id={id} name={"kanban"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Kanban Board"}>
                <Popover open={columnPopoverOpen} onOpenChange={setColumnPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button className={"h-6 border-0 shadow-none dark:shadow-none bg-tertiary px-2 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"} {...addColumnTooltip}>
                            <Plus size={16}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={"w-56"} align={"end"}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddColumn)} className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormInput placeholder="Title" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    variant={"brand"}
                                    className={"w-full mt-2"}
                                >
                                    Add column
                                </Button>

                            </form>
                        </Form>
                    </PopoverContent>
                </Popover>
            </WidgetHeader>
            <WidgetContent>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-grow gap-4 overflow-x-auto pb-4">
                            {columns.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    onAddCardToColumn={handleAddCardToColumn}
                                    onDeleteColumn={handleColumnDelete}
                                    onDeleteCard={handleCardDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </WidgetContent>
        </WidgetTemplate>
    )
}

interface KanbanColumnProps {
    column: Column
    onAddCardToColumn: (columnId: string, title: string) => void
    onDeleteColumn: (columnId: string) => void
    onDeleteCard: (cardId: string) => void
}

function KanbanColumn({column, onAddCardToColumn, onDeleteColumn, onDeleteCard}: KanbanColumnProps) {
    const [newCardTitle, setNewCardTitle] = useState("")
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "column",
            column,
        },
    })

    const deleteColumnTooltip = tooltip<HTMLButtonElement>({
        message: "Delete column",
        anchor: "tc"
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleAddCardSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newCardTitle.trim()) {
            onAddCardToColumn(column.id, newCardTitle.trim())
            setNewCardTitle("")
        }
    }

    return (
        <div
            className={"flex flex-col justify-between gap-2 w-56 bg-secondary rounded-md border border-main/40 p-2 shadow-xs dark:shadow-md"}
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
            <div className={"flex flex-col gap-2"}>
                <div className={"flex items-center justify-between text-primary font-medium border-b border-main/40 -mx-2 px-2 pb-2"}>
                    {column.title}
                    <Button
                        className={"h-6 border-0 text-tertiary shadow-none dark:shadow-none bg-0 px-2 hover:bg-inverted/10 hover:text-primary"}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteColumn(column.id)
                        }}
                        {...deleteColumnTooltip}
                    >
                        <Trash size={16}/>
                    </Button>
                </div>

                <div className={"flex-grow min-h-[100px]"}>
                    <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-0.5">
                            {column.cards.map((card) => (
                                <KanbanCard key={card.id} card={card} onCardDelete={() => onDeleteCard(card.id)}/>
                            ))}
                        </div>
                    </SortableContext>
                </div>
                </div>
            <form onSubmit={handleAddCardSubmit} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Add new task..."
                    value={newCardTitle}
                    onChange={(e: any) => setNewCardTitle(e.target.value)}
                    className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0"}
                />
                <Button
                    className={"px-2 border-0 hover:bg-inverted/10 shadow-none dark:shadow-none"}
                    type={"submit"}
                >
                    <Forward size={16}/>
                </Button>
            </form>
        </div>
    )
}

interface KanbanCardProps {
    card: Card
    onCardDelete: (cardId: string) => void
}

function KanbanCard({card, onCardDelete}: KanbanCardProps) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: {
            type: "card",
            card,
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            className={"group flex flex gap-2 items-center justify-between rounded-md p-1 bg-primary border border-main/20"}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <p>{card.title}</p>
            <Button
                className={"hidden group-hover:flex px-1 h-6"}
                onClick={(e) => {
                    e.stopPropagation()
                    onCardDelete(card.id)
                }}
            >
                <Trash size={14}/>
            </Button>
        </div>
    )
}


export {KanbanWidget}