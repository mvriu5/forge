import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {useBreakpoint} from "@/hooks/media/useBreakpoint"
import {cn} from "@/lib/utils"
import {useDraggable} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
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
    onWidgetDelete?: (id: string) => void
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
    className,
    children,
    name,
    widget,
    sizes,
    editMode,
    onWidgetDelete
}) => {
    const {breakpoint} = useBreakpoint()
    const responsiveSize = sizes[breakpoint]

    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: widget.id,
        data: {widget},
        disabled: !editMode
    })

    const deleteTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete this widget",
        anchor: "tc",
        offset: 8
    })

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: isDragging ? "none" : "transform 200ms ease",
        gridColumnStart: widget.positionX + 1,
        gridRowStart: widget.positionY + 1,
        gridColumnEnd: widget.positionX + 1 + responsiveSize.width,
        gridRowEnd: widget.positionY + 1 + responsiveSize.height,
        zIndex: isDragging ? 30 : 20,
    }

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "h-full flex flex-col gap-2 rounded-md bg-tertiary border border-main/40 p-2 overflow-hidden",
                editMode && "relative cursor-grab active:cursor-grabbing animate-[wiggle_1s_ease-in-out_infinite]",
                editMode && isDragging && "opacity-70 animate-none border-2 border-dashed border-main/60",
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

export {WidgetContainer, type WidgetSizes}
