import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {useBreakpoint} from "@/hooks/media/useBreakpoint"
import {cn} from "@/lib/utils"
import {useDraggable, useDroppable} from "@dnd-kit/core"
import {Trash} from "lucide-react"
import type {HTMLAttributes} from "react"
import React from "react"
import {Widget} from "@/database"

interface WidgetSizes {
    desktop: { width: number; height: number }
    tablet: { width: number; height: number }
    mobile: { width: number; height: number }
}

interface WidgetContainerProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    name: string
    widget: Widget
    sizes: WidgetSizes
    editMode: boolean
    previewPosition?: { x: number; y: number } | null
    previewOpacity?: boolean
    onWidgetDelete?: (id: string) => void
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
    className,
    children,
    name,
    widget,
    sizes,
    editMode,
    previewPosition,
    previewOpacity,
    onWidgetDelete
}) => {
    const {breakpoint} = useBreakpoint()
    const responsiveSize = sizes[breakpoint]

    const {attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging} = useDraggable({
        id: widget.id,
        data: {widget},
        disabled: !editMode
    })
    const {setNodeRef: setDroppableNodeRef} = useDroppable({
        id: `widget-drop-${widget.id}`,
        data: { widgetId: widget.id, x: widget.positionX, y: widget.positionY },
        disabled: !editMode
    })

    const deleteTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete this widget",
        anchor: "tc",
        offset: 8
    })

    const gridPosition = previewPosition ?? { x: widget.positionX, y: widget.positionY }

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition: isDragging ? "none" : "transform 200ms ease",
        gridColumnStart: gridPosition.x + 1,
        gridRowStart: gridPosition.y + 1,
        gridColumnEnd: gridPosition.x + 1 + responsiveSize.width,
        gridRowEnd: gridPosition.y + 1 + responsiveSize.height,
        zIndex: isDragging ? 30 : 20,
    }

    return (
        <div
            ref={(node) => {
                setDraggableNodeRef(node)
                setDroppableNodeRef(node)
            }}
            className={cn(
                "h-full flex flex-col gap-2 rounded-md bg-tertiary border border-main/40 p-2 overflow-hidden",
                editMode && "relative cursor-grab active:cursor-grabbing animate-[wiggle_1s_ease-in-out_infinite]",
                editMode && isDragging && "opacity-70 animate-none border-2 border-dashed border-main/60",
                editMode && previewOpacity && !isDragging && "opacity-45",
                className
            )}
            style={style}
            {...(editMode ? {...attributes, ...listeners} : {})}
        >
            {editMode && (
                <Button
                    className="absolute z-50 size-8 bg-error/20 hover:bg-error/30 text-error hover:text-error border-error/40 bottom-2 backdrop-blur-lg"
                    onClick={() => {
                        deleteTooltip.onMouseLeave?.()
                        onWidgetDelete?.(widget.id)
                    }}
                    {...deleteTooltip}
                >
                    <Trash size={20}/>
                </Button>
            )}
            <div
                className={cn(editMode && "pointer-events-none")}
                style={{display: "contents"}}
            >
                {children}
            </div>
        </div>
    )
}

export {WidgetContainer}
