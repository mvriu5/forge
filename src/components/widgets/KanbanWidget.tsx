"use client"

import React, {useState} from "react"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Button} from "@/components/ui/Button"
import {Forward, Plus, Trash} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {cn} from "@/lib/utils"
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
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
import {Input} from "../ui/Input"
import {ScrollArea} from "@/components/ui/ScrollArea"
import Compact from "@uiw/react-color-compact"
import {convertToRGBA} from "@/lib/colorConvert"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {restrictToFirstScrollableAncestor, restrictToHorizontalAxis, restrictToWindowEdges} from "@dnd-kit/modifiers"
import {defineWidget, WidgetProps } from "@tryforgeio/sdk"

type Card = {
    id: string
    title: string
}

type Column = {
    id: string
    title: string
    color: string
    cards: Card[]
}

interface KanbanConfig {
    columns: Column[]
}

const formSchema = z.object({
    title: z.string()
})

const KanbanWidget: React.FC<WidgetProps<KanbanConfig>> = ({config, updateConfig}) => {
    const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [hex, setHex] = useState("#ffffff")

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

    const addColumnTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new category",
        anchor: "tc"
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        },
    })

    const findColumn = (cols: Column[], id: string) => {
        if (id.startsWith("column-")) {
            return cols.find((col) => col.id === id)
        }
        return cols.find((col) => col.cards.some((card) => card.id === id))
    }

    const handleAddColumn = async (column: Partial<Column>) => {
        if (!updateConfig) return

        if (column.title?.trim()) {
            const newColumn: Column = {
                id: `column-${crypto.randomUUID()}`,
                title: column.title.trim(),
                color: hex,
                cards: [],
            }

            await updateConfig(prev => ({
                ...prev,
                columns: [...(prev.columns ?? []), newColumn],
            }))

            setColumnPopoverOpen(false)
            setHex("#ffffff")
            form.reset()
        }
    }

    const handleColumnDelete = async (columnId: string) => {
        if (!updateConfig) return

        await updateConfig(prev => ({
            ...prev,
            columns: (prev.columns ?? []).filter(col => col.id !== columnId),
        }))
    }

    const handleCardDelete = async (cardId: string) => {
        if (!updateConfig) return

        await updateConfig(prev => ({
            ...prev,
            columns: (prev.columns ?? []).map(col => ({
                ...col,
                cards: col.cards.filter(card => card.id !== cardId),
            })),
        }))
    }

    const handleAddCardToColumn = async (columnId: string, title: string) => {
        if (!updateConfig) return

        const newCard: Card = {
            id: `card-${crypto.randomUUID()}`,
            title,
        }

        await updateConfig(prev => ({
            ...prev,
            columns: (prev.columns ?? []).map(col =>
                col.id === columnId
                    ? { ...col, cards: [...col.cards, newCard] }
                    : col
            ),
        }))
    }

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        if (!updateConfig) return

        void updateConfig(prev => {
            const prevColumns = [...(prev.columns ?? [])]

            const activeContainer = findColumn(prevColumns, active.id as string)
            const overContainer = findColumn(prevColumns, over.id as string)

            if (!activeContainer || !overContainer || activeContainer.id === overContainer.id) {
                return prev
            }

            if (!active.id.toString().startsWith("card-")) return prev

            const activeColumnIndex = prevColumns.findIndex(col => col.id === activeContainer.id)
            const overColumnIndex = prevColumns.findIndex(col => col.id === overContainer.id)
            if (activeColumnIndex === -1 || overColumnIndex === -1) return prev

            const activeCardIndex = prevColumns[activeColumnIndex].cards.findIndex(card => card.id === active.id)
            if (activeCardIndex === -1) return prev

            const [movedCard] = prevColumns[activeColumnIndex].cards.splice(activeCardIndex, 1)

            let newCardIndex: number
            if (over.id.toString().startsWith("card-")) {
                newCardIndex = prevColumns[overColumnIndex].cards.findIndex(card => card.id === over.id)
                if (newCardIndex === -1) {
                    newCardIndex = prevColumns[overColumnIndex].cards.length
                }
            } else {
                newCardIndex = prevColumns[overColumnIndex].cards.length
            }

            prevColumns[overColumnIndex].cards.splice(newCardIndex, 0, movedCard)

            return {
                ...prev,
                columns: prevColumns,
            }
        })
    }

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        if (!over || active.id === over.id) return
        if (!updateConfig) return

        const isDraggingColumn = active.id.toString().startsWith("column-")
        const isDraggingCard = active.id.toString().startsWith("card-")

        void updateConfig(prev => {
            const prevColumns = [...(prev.columns ?? [])]
            const activeContainer = findColumn(prevColumns, active.id as string)
            const overContainer = findColumn(prevColumns, over.id as string)

            if (!activeContainer || !overContainer) return prev

            if (isDraggingColumn && activeContainer.id !== overContainer.id) {
                const oldIndex = prevColumns.findIndex(col => col.id === active.id)
                const newIndex = prevColumns.findIndex(col => col.id === over.id)
                if (oldIndex === -1 || newIndex === -1) return prev

                return {
                    ...prev,
                    columns: arrayMove(prevColumns, oldIndex, newIndex),
                }
            }

            if (isDraggingCard && activeContainer.id === overContainer.id) {
                const columnIndex = prevColumns.findIndex(col => col.id === activeContainer.id)
                if (columnIndex === -1) return prev

                const oldCardIndex = prevColumns[columnIndex].cards.findIndex(card => card.id === active.id)
                const newCardIndex = prevColumns[columnIndex].cards.findIndex(card => card.id === over.id)
                if (oldCardIndex === -1 || newCardIndex === -1) return prev

                prevColumns[columnIndex].cards = arrayMove(
                    prevColumns[columnIndex].cards,
                    oldCardIndex,
                    newCardIndex
                )

                return {
                    ...prev,
                    columns: prevColumns,
                }
            }

            return prev
        })
    }

    return (
        <>
            <WidgetHeader title={"Kanban Board"}>
                <Popover open={columnPopoverOpen} onOpenChange={setColumnPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant={"widget"} className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"} {...addColumnTooltip}>
                            <Plus size={16}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={"w-64"} align={"end"}>
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
                                <p className={"pt-2 text-tertiary text-sm"}>Color</p>
                                <Compact
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        boxShadow: "none",
                                    }}
                                    color={hex}
                                    colors={[
                                        "#FF4C4C", // Knallrot
                                        "#FF914D", // Helles Orange
                                        "#FFC300", // Sattgelb
                                        "#90EE02", // Neongrün
                                        "#00E0B8", // Türkis
                                        "#00BFFF", // Himmelsblau
                                        "#4B7EFF", // Klares Blau
                                        "#A066FF", // Violett
                                        "#FF66C4", // Knallpink
                                        "#FF8FAB", // Rosé
                                        "#FFDE59", // Sonnengelb
                                        "#8CFF98", // Mintgrün
                                        "#A1E3D8", // Eisgrün
                                        "#00FFAB", // Neon-Aqua
                                        "#85E3FF", // Babyblau
                                        "#B28DFF", // Flieder
                                        "#FFAB76", // Apricot
                                        "#FFD6A5", // Pastellorange
                                        "#D291BC", // Pastelllila
                                        "#FF6F61", // Korallrot
                                        "#FFB5E8", // Zuckerwatte
                                        "#C1FFD7", // Sanftgrün
                                        "#FFFF8F", // Zitronengelb
                                        "#D0AAFF"  // Lavendel
                                    ]}
                                    onChange={(color) => {
                                        setHex(color.hex);
                                    }}
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
                {config.columns.length === 0 ? (
                    <WidgetEmpty message={"No categories yet. Add a category or import from another app to get started."}/>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                        modifiers={activeId?.startsWith("column-") ? [restrictToHorizontalAxis, restrictToFirstScrollableAncestor] : [restrictToWindowEdges]}
                    >
                        <SortableContext items={config.columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
                            <ScrollArea className={"min-w-80"} orientation={"horizontal"} thumbClassname={"bg-white/10"}>
                                <div className="flex gap-4 overflow-x-auto">
                                    {config.columns.map((column) => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            onAddCardToColumn={handleAddCardToColumn}
                                            onDeleteColumn={handleColumnDelete}
                                            onDeleteCard={handleCardDelete}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </SortableContext>
                    </DndContext>
                )}
            </WidgetContent>
        </>
    )
}

interface KanbanColumnProps {
    column: Column
    onAddCardToColumn: (columnId: string, title: string) => void
    onDeleteColumn: (columnId: string) => void
    onDeleteCard: (cardId: string) => void
    isPlaceholder?: boolean
}

function KanbanColumn({column, onAddCardToColumn, onDeleteColumn, onDeleteCard, isPlaceholder = false}: KanbanColumnProps) {
    const [newCardTitle, setNewCardTitle] = useState("")
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "column",
            column,
        },
    })

    const deleteColumnTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete column",
        anchor: "tc"
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: convertToRGBA(column.color, 0.2),
        border: `1px solid ${convertToRGBA(column.color, 0.2)}`,
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
            className={cn("flex flex-col justify-between gap-2 h-full min-w-52 rounded-md p-2 shadow-xs dark:shadow-md", isPlaceholder && "pointer-events-none")}
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
            <div className={"flex flex-col gap-2"}>
                <div
                    className={"flex items-center justify-between font-medium -mx-2 px-2 pb-2"}
                    style={{
                        color: column.color,
                        borderBottom: `1px solid ${convertToRGBA(column.color, 0.2)}`,
                }}
                >
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

                <ScrollArea className={"h-54"} thumbClassname={"bg-white/10"}>
                    <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-0.5">
                            {column.cards.map((card) => (
                                <KanbanCard
                                    key={card.id}
                                    card={card}
                                    onCardDelete={() => onDeleteCard(card.id)}
                                    color={column.color}
                                    isPlaceholder={isPlaceholder}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </ScrollArea>
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
    color: string
    onCardDelete: (cardId: string) => void
    isPlaceholder?: boolean
}

function KanbanCard({card, color, onCardDelete, isPlaceholder = false}: KanbanCardProps) {
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
        opacity: isDragging ? 0.5 : 1,
        background: convertToRGBA(color, 0.2),
        border: `1px solid ${convertToRGBA(color, 0.3)}`,
    }

    return (
        <div
            className={cn("group flex gap-2 items-center justify-between rounded-md p-1 text-primary", isPlaceholder && "pointer-events-none")}
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

export const kanbanWidgetDefinition = defineWidget({
    name: "Kanban",
    component: KanbanWidget,
    description: "Organize your tasks in a kanban board",
    image: "/github_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 2, height: 2 },
        tablet: { width: 2, height: 2 },
        mobile: { width: 1, height: 1 }
    },
    defaultConfig: {
        columns: []
    }
})
