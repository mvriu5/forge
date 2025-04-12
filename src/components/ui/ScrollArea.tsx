"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
    thumbClassname?: string
}

interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
    orientation?: "vertical" | "horizontal"
    thumbClassname?: string
}

const ScrollArea = React.forwardRef<React.ComponentRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(({ className, thumbClassname, children, ...props }, ref) => {
    return (
        <ScrollAreaPrimitive.Root
            className={cn("relative overflow-hidden", className)}
            ref={ref}
            {...props}
        >
            <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
                {children}
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar thumbClassname={thumbClassname}/>
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, ScrollBarProps>(({ className, thumbClassname, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation={orientation}
        className={cn(
            "flex touch-none select-none transition-colors",
            orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
            orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
            className
        )}
        ref={ref}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb className={cn("relative flex-1 rounded-full bg-tertiary", thumbClassname)}/>
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
