"use client"

import {ToggleGroup as ToggleGroupPrimitive} from "radix-ui"
import { cn } from "../lib/utils"
import {ComponentPropsWithRef} from "react"

const ToggleGroup = ({ className, children, ...props }: ComponentPropsWithRef<typeof ToggleGroupPrimitive.Root>) => {
    return (
        <ToggleGroupPrimitive.Root
            className={cn("h-8 flex items-center justify-center gap-2 bg-secondary rounded-md p-1 border border-main", className)}
            {...props}
        >
                {children}
        </ToggleGroupPrimitive.Root>
    )
}

const ToggleGroupItem = ({ className, children, ...props }: ComponentPropsWithRef<typeof ToggleGroupPrimitive.Item>) => {
    return (
        <ToggleGroupPrimitive.Item
            className={cn(
                "px-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary",
                className
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    )
}

export {
    ToggleGroup,
    ToggleGroupItem
}
