"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn, CONTAINER_STYLES } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {}

const PopoverContent = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 w-72 rounded-md bg-primary p-4 text-secondary border border-main/40",
                    "shadow-md outline-none data-[side=bottom]:slide-in-from-top-2",
                    CONTAINER_STYLES.animation,
                    className
                )}
                ref={ref}
                {...props}
            />
        </PopoverPrimitive.Portal>
    )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export {
    Popover,
    PopoverTrigger,
    PopoverContent
}