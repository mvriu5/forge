"use client"

import * as React from "react"
import {Switch as SwitchPrimitives} from "radix-ui"
import { cn } from "@/lib/utils"
import {ComponentPropsWithRef} from "react"


const Switch = ({ className, ...props }: ComponentPropsWithRef<typeof SwitchPrimitives.Root>) => {
    return (
        <SwitchPrimitives.Root
            className={cn(
                "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
                "disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-tertiary",
                className
            )}
            {...props}
        >
            <SwitchPrimitives.Thumb
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg",
                    "ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                )}
            />
        </SwitchPrimitives.Root>
    )
}

export { Switch }