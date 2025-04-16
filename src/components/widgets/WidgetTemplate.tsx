import React, {ReactNode} from "react"
import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import {useDraggable} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
import {useWidgetStore} from "@/store/widgetStore"
import {Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import { tooltip } from "@/components/ui/TooltipProvider"

interface WidgetProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    name: string
    editMode: boolean
    onWidgetDelete: (id: string) => void
}

const WidgetTemplate: React.FC<WidgetProps> = ({className, children, name, editMode, onWidgetDelete}) => {
    const {getWidget} = useWidgetStore()
    const widget = getWidget(name)

    if (!widget) return

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: widget.id,
        data: {widget}
    })

    const deleteTooltip = tooltip<HTMLButtonElement>({
        message: "Delete this widget",
        anchor: "tc",
        offset: 8
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : "transform 200ms ease",
        gridColumnStart: widget.positionX + 1,
        gridRowStart: widget.positionY + 1,
        gridColumnEnd: widget.positionX + 1 + widget.width,
        gridRowEnd: widget.positionY + 1 + widget.height,
        zIndex: isDragging ? 30 : 20,
    }

    if (editMode) {
        return (
            <div
                className={cn(
                    "relative rounded-md bg-tertiary border overflow-hidden border-main/40 p-4 cursor-grab active:cursor-grabbing animate-[wiggle_1s_ease-in-out_infinite]",
                    isDragging && "opacity-50 animate-none",
                    className
                )}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            >
                <Button
                    className={"absolute z-50 size-8 bg-error/10 hover:bg-error/20 text-error hover:text-error border-error/40 bottom-4"}
                    onClick={() => {
                        if (deleteTooltip.onMouseLeave) {
                            deleteTooltip?.onMouseLeave()
                        }
                        onWidgetDelete(widget?.id)
                    }}
                    {...deleteTooltip}
                >
                    <Trash size={20}/>
                </Button>
                <div className={cn("pointer-events-none", className)} style={{ display: "contents" }}>
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden",
                className
            )}
            style={style}
        >
            {children}
        </div>
    )
}

export { WidgetTemplate, type WidgetProps }