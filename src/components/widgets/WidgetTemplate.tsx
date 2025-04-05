import type React from "react"
import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {useWidgetStore} from "@/store/widgetStore"
import {Button} from "lunalabs-ui"
import {Trash} from "lucide-react"

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
        gridColumnStart: widget.positionX,
        gridRowStart: widget.positionY,
        gridColumnEnd: widget.positionX + widget.width,
        gridRowEnd: widget.positionY + widget.height,
        zIndex: isDragging ? 30 : 20,
    }

    return (
        <>
            {editMode ? (
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
                    <div className={"z-50 sticky bottom-0 left-0"}>
                        <Button className={"px-1.5 bg-error/10 border-error/20 text-error hover:bg-error/40 hover:text-error shadow-lg"}>
                            <Trash size={20}/>
                        </Button>
                    </div>
                </div>
                ) : (
                <div
                    className={cn(
                        "col-span-2 row-span-2 rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden",
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