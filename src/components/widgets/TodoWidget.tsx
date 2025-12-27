"use client"

import React, {useCallback, useEffect, useRef} from "react"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Checkbox} from "@/components/ui/Checkbox"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/Button"
import {Eraser, Forward, Trash} from "lucide-react"
import {Input} from "@/components/ui/Input"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import {useNotifications} from "@/hooks/data/useNotifications"
import {useSettings} from "@/hooks/data/useSettings"

type Todo = {
    id: string
    checked: boolean
    text: string
    createdAt: string
}

interface TodoConfig {
    todos: Todo[]
}

const TodoWidget: React.FC<WidgetProps<TodoConfig>> = ({widget, config, updateConfig}) => {
    const {settings} = useSettings(widget.userId)
    const {sendReminderNotification} = useNotifications(widget.userId)

    const inputRef = useRef<HTMLInputElement>(null)

    const clearTodosTooltip = useTooltip<HTMLButtonElement>({
        message: "Clear all todos",
        anchor: "tc"
    })

    const hasOldTodos = useCallback(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return config.todos.some((todo) => {
            const todoDate = new Date(todo.createdAt)
            todoDate.setHours(0, 0, 0, 0)

            return todoDate < today
        })
    }, [config.todos])

    useEffect(() => {
        if (!settings?.config.todoReminder) return

        if (settings?.config.deleteTodos && hasOldTodos()) return

        const pendingTodos = config.todos.filter((todo) => !todo.checked)
        if (pendingTodos.length === 0) return

        void sendReminderNotification({
            message: `You have ${pendingTodos.length} pending ${pendingTodos.length == 1 ? "todo" : "todos"} for today!`,
            type: "reminder",
            key: "todo-reminder",
        })
    }, [sendReminderNotification, settings?.config.deleteTodos, settings?.config.todoReminder, config.todos, hasOldTodos])

    const handleSave = useCallback(async (updatedTodos: Todo[]) => {
        await updateConfig({ todos: updatedTodos })
    }, [updateConfig])

    useEffect(() => {
        if (!settings?.config.deleteTodos) return
        if (config.todos.length === 0) return

        if (!hasOldTodos()) return

        void handleSave([])
    }, [config.todos, handleSave, hasOldTodos, settings?.config.deleteTodos])

    const enterInput = useCallback(async () => {
        const input = inputRef.current!
        if (input?.value.trim()) {
            const newTodo: Todo = {
                id: crypto.randomUUID(),
                text: input.value.trim(),
                checked: false,
                createdAt: new Date().toISOString()
            }
            const updatedTodos = [...config.todos, newTodo]
            await handleSave(updatedTodos)
            input.value = ""
        }
    }, [inputRef.current, config.todos, handleSave])

    const handleDelete = useCallback(async (indexToDelete: number) => {
        const updatedTodos = config.todos.filter((_, i) => i !== indexToDelete)
        await handleSave(updatedTodos)
    }, [config.todos, handleSave])

    const handleCheckChange = useCallback(async (indexToUpdate: number, checked: boolean) => {
        const updatedTodos = config.todos.map((todo, index) => index === indexToUpdate ? {...todo, checked} : todo)
        await handleSave(updatedTodos)
    }, [config.todos, handleSave])

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

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = config.todos.findIndex((item) => item.id === active.id)
        const newIndex = config.todos.findIndex((item) => item.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        const newOrder = arrayMove(config.todos, oldIndex, newIndex)
        void handleSave(newOrder)
    }, [config.todos, handleSave])

    return (
        <>
            <WidgetHeader title={"Todos"}>
                <Button
                    variant={"widget"}
                    onClick={() => void handleSave([])}
                    {...clearTodosTooltip}
                >
                    <Eraser size={16} />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext
                        items={config.todos.map((todo) => todo.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {config.todos.map((todo, index) => (
                            <Todo
                                key={todo.id}
                                id={todo.id}
                                text={todo.text}
                                checked={todo.checked}
                                onDelete={() => void handleDelete(index)}
                                onCheckChange={(checked) => void handleCheckChange(index, checked)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </WidgetContent>
            <div className={"flex items-center gap-2"}>
                <Input
                    className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0"}
                    placeholder={"Type your todo..."}
                    ref={inputRef}
                    onKeyDown={(e) => e.key === "Enter" && void enterInput()}
                />
                <Button
                    className={"px-2 border-0 hover:bg-inverted/10 shadow-none dark:shadow-none"}
                    onClick={() => void enterInput()}
                >
                    <Forward size={16}/>
                </Button>
            </div>
        </>
    )
}

const Todo = ({id, checked, text, onDelete, onCheckChange}: Omit<Todo, "createdAt"> & { onDelete: () => void; onCheckChange: (checked: boolean) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id })

    const toggleChecked = () => onCheckChange(!checked)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0, // Bring dragged item to front
        opacity: isDragging ? 0.8 : 1, // Visual feedback for dragging
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={"group min-h-8 flex items-center justify-between cursor-pointer pl-2 pr-1 gap-4 rounded-md hover:bg-secondary"}
            onClick={toggleChecked}
        >
            <div className={"flex items-center gap-4 w-full"}>
                <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => onCheckChange(!!value)}
                />
                <p className={cn("break-all", checked && "line-through")}>{text}</p>
            </div>
            <Button
                className={"hidden group-hover:flex px-1 h-6"}
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
            >
                <Trash size={14}/>
            </Button>
        </div>
    )
}

export const todoWidgetDefinition = defineWidget({
    name: "Todo",
    component: TodoWidget,
    description: 'All your tasks in one place',
    image: "/todo_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 1 }
    },
    defaultConfig: {
        todos: []
    }
})
