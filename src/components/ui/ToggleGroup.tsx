"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "@/lib/utils"

const ToggleGroup = React.forwardRef<React.ComponentRef<typeof ToggleGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>>(({ className, children, ...props }, ref) => {
    return (
        <ToggleGroupPrimitive.Root
            ref={ref}
            className={cn("h-8 flex items-center justify-center gap-2 bg-secondary rounded-md p-1 border border-main", className)}
            {...props}
        >
                {children}
        </ToggleGroupPrimitive.Root>
    )
})
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<React.ComponentRef<typeof ToggleGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>>(({ className, children, ...props }, ref) => {
    return (
        <ToggleGroupPrimitive.Item
            ref={ref}
            className={cn(
                "px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary",
                className
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export {
    ToggleGroup,
    ToggleGroupItem
}
