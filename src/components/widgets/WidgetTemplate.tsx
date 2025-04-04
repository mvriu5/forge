import React, {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {useWidgetStore} from "@/store/widgetStore"

interface WidgetTemplateProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    name: string
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({className, children, name}) => {
    const {getWidget} = useWidgetStore()
    const widget = getWidget(name)

    if (!widget) return

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: name,
        data: {widget}
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : "transform 200ms ease",
        gridColumnStart: widget.positionX,
        gridRowStart: widget.positionY,
        gridColumnEnd: widget.positionX + widget.width,
        gridRowEnd: widget.positionY + widget.height,
        zIndex: isDragging ? 10 : 1,
    }

    return (
        <div
            className={cn(
                "col-span-2 row-span-2 rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50",
                className
            )}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    )
}

export { WidgetTemplate }