import type React from "react"
import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import {useDraggable} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
import {useWidgetStore} from "@/store/widgetStore"

interface WidgetTemplateProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    name: string
    editMode: boolean
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({className, children, name, editMode}) => {
    const {getWidget} = useWidgetStore()
    const widget = getWidget(name)

    if (!widget) return

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: widget.id,
        data: {widget}
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

    return (
        <>
            {editMode ? (
                <div
                    className={cn(
                        "relative rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden cursor-grab active:cursor-grabbing",
                        isDragging && "opacity-50",
                        className
                    )}
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                >
                    <div className={"pointer-events-none"}>
                        {children}
                    </div>
                </div>
                ) : (
                <div
                    className={cn(
                        "rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden",
                        className
                    )}
                    style={style}
                >
                    {children}
                </div>
            )}
        </>
    )
}

export { WidgetTemplate }