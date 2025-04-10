import type React from "react"
import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import {useDraggable} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
import {useWidgetStore} from "@/store/widgetStore"
import {Trash} from "lucide-react"
import {Button, tooltip} from "lunalabs-ui"

interface WidgetTemplateProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    name: string
    editMode: boolean
    onWidgetDelete: (widgetType: string) => void
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({className, children, name, editMode, onWidgetDelete}) => {
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

    return (
        <>
            {editMode ? (
                <div
                    className={cn(
                        "relative rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden cursor-grab active:cursor-grabbing animate-[wiggle_1s_ease-in-out_infinite]",
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
                        onClick={() => onWidgetDelete(widget?.widgetType)}
                        {...deleteTooltip}
                    >
                        <Trash size={20}/>
                    </Button>
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