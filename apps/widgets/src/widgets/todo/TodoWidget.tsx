"use client"

import React, {useCallback, useRef, useState} from "react"
import {Eraser, Forward, Trash} from "lucide-react"
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent, MouseSensor, TouchSensor,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { arrayMove } from "@dnd-kit/sortable"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import { tooltip } from "@forge/ui/components/TooltipProvider"
import {WidgetHeader} from "../base/WidgetHeader"
import {Button} from "@forge/ui/components/Button"
import { WidgetContent } from "../base/WidgetContent"
import {Input} from "@forge/ui/components/Input"
import {Checkbox} from "@forge/ui/components/Checkbox"
import {cn} from "@forge/ui/lib/utils"

interface TodoProps {
    id: string
    checked: boolean
    text: string
}

interface TodoWidgetProps extends WidgetProps {
    onUpdateTodos: (todos: TodoProps[]) => void
}

const TodoWidget: React.FC<TodoWidgetProps> = ({widget, editMode, onWidgetDelete, onUpdateTodos}) => {
    const [todos, setTodos] = useState<TodoProps[]>(widget.config?.todos ?? [])
    const inputRef = useRef<HTMLInputElement>(null)

    const clearTodosTooltip = tooltip<HTMLButtonElement>({
        message: "Clear all todos",
        anchor: "tc"
    })

    const enterInput = () => {
        const input = inputRef.current!
        if (input?.value.trim()) {
            const newTodo: TodoProps = {
                id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID
                text: input.value.trim(),
                checked: false,
            }
            const updatedTodos = [...todos, newTodo]
            setTodos(updatedTodos)
            onUpdateTodos(updatedTodos)
            input.value = ""
        }
    }

    const handleDelete = useCallback((indexToDelete: number) => {
        const updatedTodos = todos.filter((_, i) => i !== indexToDelete)
        setTodos(updatedTodos)
        onUpdateTodos(updatedTodos)
    }, [todos, onUpdateTodos])

    const handleCheckChange = useCallback((indexToUpdate: number, checked: boolean) => {
        const updatedTodos = [...todos]
        updatedTodos[indexToUpdate].checked = checked
        setTodos(updatedTodos)
        onUpdateTodos(updatedTodos)
    }, [todos, onUpdateTodos])

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

            if (active.id !== over?.id) {
                setTodos((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id)
                    const newIndex = items.findIndex((item) => item.id === over?.id)
                    const newOrder = arrayMove(items, oldIndex, newIndex)
                    onUpdateTodos(newOrder)
                    return newOrder
                })
            }
        }, [onUpdateTodos])

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Todos"}>
                <Button
                    variant={"widget"}
                    onClick={() => {
                        setTodos([])
                        onUpdateTodos([])
                    }}
                    {...clearTodosTooltip}
                >
                    <Eraser size={16} />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext
                        items={todos.map((todo) => todo.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {todos.map((todo, index) => (
                            <Todo
                                key={todo.id}
                                id={todo.id}
                                text={todo.text}
                                checked={todo.checked}
                                onDelete={() => handleDelete(index)}
                                onCheckChange={(checked) => handleCheckChange(index, checked)}
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
                    onKeyDown={(e) => e.key === "Enter" && enterInput()}
                />
                <Button
                    className={"px-2 border-0 hover:bg-inverted/10 shadow-none dark:shadow-none"}
                    onClick={ () => enterInput()}
                >
                    <Forward size={16}/>
                </Button>
            </div>
        </WidgetTemplate>
    )
}

const Todo = ({id, checked, text, onDelete, onCheckChange}: TodoProps & { onDelete: () => void; onCheckChange: (checked: boolean) => void }) => {
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

export {TodoWidget}