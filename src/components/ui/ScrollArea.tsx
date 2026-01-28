"use client"

import { cn } from "@/lib/utils"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import * as React from "react"

interface ScrollAreaProps extends React.ComponentPropsWithRef<typeof ScrollAreaPrimitive.Root> {
    thumbClassname?: string
    orientation?: "vertical" | "horizontal"
}

interface ScrollBarProps extends React.ComponentPropsWithRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
    orientation?: "vertical" | "horizontal"
    thumbClassname?: string
}

const ScrollArea = ({ className, thumbClassname, orientation = "vertical", children, ...props }: ScrollAreaProps) => {
    return (
        <ScrollAreaPrimitive.Root
            className={cn("relative overflow-hidden", className)}
            {...props}
        >
            <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
                {children}
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar thumbClassname={thumbClassname} orientation={orientation}/>
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    )
}

const ScrollBar = ({ className, thumbClassname, orientation = "vertical", ...props }: ScrollBarProps) => {
    return (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
            orientation={orientation}
            className={cn(
                "flex touch-none select-none transition-colors",
                orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px",
                orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-px",
                className
            )}
            {...props}
        >
            <ScrollAreaPrimitive.ScrollAreaThumb className={cn("relative flex-1 rounded-full bg-tertiary", thumbClassname)}/>
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
    )
}

export { ScrollArea, ScrollBar }
