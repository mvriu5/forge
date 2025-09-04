import React, {HTMLAttributes} from "react"
import {useDraggable} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
import {Trash} from "lucide-react"
import {Button} from "@forge/ui/components/Button"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import {getWidgetPreview} from "../widgetRegistry.tsx"
import {useBreakpoint} from "@forge/ui/hooks/useBreakpoint"
import {cn} from "@forge/ui/lib/utils"
import {Widget} from "../../types"

interface WidgetProps extends HTMLAttributes<HTMLDivElement> {
    widget: Widget
    editMode?: boolean
    onWidgetDelete?: (id: string) => void
}

const WidgetTemplate: React.FC<WidgetProps> = ({widget, className, children, editMode, onWidgetDelete}) => {
    const {breakpoint} = useBreakpoint()

    const widgetConfig = getWidgetPreview(widget.widgetType)
    if (!widgetConfig) return

    const responsiveSize = widgetConfig.preview.sizes[breakpoint]

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
        gridColumnEnd: widget.positionX + 1 + responsiveSize.width,
        gridRowEnd: widget.positionY + 1 + responsiveSize.height,
        zIndex: isDragging ? 30 : 20,
    }

    return (
        <div
            className={cn(
                `h-full flex flex-col gap-2 rounded-md bg-tertiary border border-main/40 p-2 overflow-hidden col-span-[${responsiveSize.width}] row-span-[${responsiveSize.height}]`,
                editMode && "relative cursor-grab active:cursor-grabbing animate-[wiggle_1s_ease-in-out_infinite]",
                editMode && isDragging && "opacity-70 animate-none border-2 border-dashed border-main/60",
                className
            )}
            ref={editMode ? setNodeRef : undefined}
            style={style}
            {...(editMode ? {...attributes, ...listeners} : {})}
        >
            {editMode && (
                <Button
                    className="absolute z-50 size-8 bg-error/20 hover:bg-error/30 text-error hover:text-error border-error/40 bottom-2 backdrop-blur-lg"
                    onClick={() => {
                        if (deleteTooltip.onMouseLeave) {
                            deleteTooltip?.onMouseLeave()
                        }
                        onWidgetDelete?.(widget?.id)
                    }}
                    {...deleteTooltip}
                >
                    <Trash size={20}/>
                </Button>
            )}
            <div
                className={cn(editMode ? "pointer-events-none" : undefined, className)}
                style={{ display: "contents" }}
            >
                {children}
            </div>
        </div>
    )
}

export { WidgetTemplate, type WidgetProps }