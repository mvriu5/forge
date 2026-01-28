"use client"

import { cn, CONTAINER_STYLES } from "@/lib/utils"
import { Popover as PopoverPrimitive } from "radix-ui"
import { ComponentPropsWithRef } from "react"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

type PopoverContentProps = ComponentPropsWithRef<typeof PopoverPrimitive.Content> & {
    portalled?: boolean
}

const PopoverContent = ({ className, align = "center", sideOffset = 4, portalled = true, ...props }: PopoverContentProps) => {
    const content = (
        <PopoverPrimitive.Content
            align={align}
            sideOffset={sideOffset}
            className={cn(
                "max-h-96 z-50 w-auto min-w-[--radix-popover-trigger-width] rounded-md bg-primary p-2 text-secondary border border-main/40 shadow-[10px_10px_20px_rgba(0,0,0,0.1)]",
                "dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] outline-none data-[side=bottom]:slide-in-from-top-2",
                CONTAINER_STYLES.animation,
                className
            )}
            {...props}
        />
    )

    if (!portalled) return content

    return (
        <PopoverPrimitive.Portal>
            {content}
        </PopoverPrimitive.Portal>
    )
}

export {
    Popover, PopoverContent, PopoverTrigger
}
