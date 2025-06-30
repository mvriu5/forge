"use client"

import * as React from "react"
import {Popover as PopoverPrimitive} from "radix-ui"
import { cn, CONTAINER_STYLES } from "@/lib/utils"
import {ComponentPropsWithRef} from "react"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger


const PopoverContent = ({ className, align = "center", sideOffset = 4, ...props }: ComponentPropsWithRef<typeof PopoverPrimitive.Content>) => {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 w-72 rounded-md bg-primary p-4 text-secondary border border-main/40 shadow-[10px_10px_20px_rgba(0,0,0,0.1)]",
                    "dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] outline-none data-[side=bottom]:slide-in-from-top-2",
                    CONTAINER_STYLES.animation,
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    )
}

export {
    Popover,
    PopoverTrigger,
    PopoverContent
}