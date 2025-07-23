"use client"

import React, {useRef, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Checkbox} from "@/components/ui/Checkbox"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/Button"
import {Forward, Trash} from "lucide-react"
import {Input} from "@/components/ui/Input"
import {useWidgetStore} from "@/store/widgetStore"
import {useDashboardStore} from "@/store/dashboardStore"

interface TodoProps {
    checked: boolean
    text: string
}

const TodoWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {}

    const {getWidget, refreshWidget} = useWidgetStore()

    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "todo")
    if (!widget) return

    const [todos, setTodos] = useState<TodoProps[]>(widget.config?.todos ?? [])
    const inputRef = useRef<HTMLInputElement>(null)

    const enterInput = () => {
        const input = inputRef.current!
        if (input?.value.trim()) {
            const updatedTodos = [...todos, { text: input.value.trim(), checked: false }]
            setTodos(updatedTodos)
            handleSave(updatedTodos)
            input.value = ""
        }
    }

    const handleSave = async (updatedTodos: TodoProps[] = todos) => {
        await refreshWidget({
            ...widget,
            config: {
                todos: updatedTodos,
            },
        })
    }

    return (
        <WidgetTemplate id={id} name={"todo"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Todo's"}/>
            <WidgetContent scroll>
                {todos.map((todo, index) => (
                    <Todo
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        text={todo.text}
                        checked={todo.checked}
                        onDelete={() => {
                            const updatedTodos = todos.filter((_, i) => i !== index)
                            setTodos(updatedTodos)
                            handleSave(updatedTodos)
                        }}
                        onCheckChange={(checked) => {
                            const updatedTodos = [...todos]
                            updatedTodos[index].checked = checked
                            setTodos(updatedTodos)
                            handleSave(updatedTodos)
                        }}
                    />
                ))}
            </WidgetContent>
            <div className={"flex items-center gap-2"}>
                <Input
                    className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0"}
                    placeholder={"Type your todo..."}
                    ref={inputRef}
                    onKeyDown={(e) => e.key === "Enter" && enterInput()}
                />
                <Button
                    className={"px-2 border-0 hover:bg-inverted/10"}
                    onClick={ () => enterInput()}
                >
                    <Forward size={16}/>
                </Button>
            </div>
        </WidgetTemplate>
    )
}

const Todo = ({checked, text, onDelete, onCheckChange}: TodoProps & { onDelete: () => void; onCheckChange: (checked: boolean) => void }) => {
    const toggleChecked = () => {
        onCheckChange(!checked)
    }
    return (
        <div
            className={"group h-8 flex items-center justify-between cursor-pointer pl-2 pr-1 gap-4 rounded-md hover:bg-secondary"}
            onClick={toggleChecked}
        >
            <div className={"flex items-center gap-4"}>
                <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => onCheckChange(!!value)}
                />
                <p className={cn(checked && "line-through")}>{text}</p>
            </div>
            <Button
                variant={"ghost"}
                className={"p-1 h-6 hidden group-hover:flex hover:text-error hover:bg-error/10"}
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