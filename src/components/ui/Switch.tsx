"use client"

import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitives } from "radix-ui"
import { ComponentPropsWithRef } from "react"


const Switch = ({ className, ...props }: ComponentPropsWithRef<typeof SwitchPrimitives.Root>) => {
    return (
        <SwitchPrimitives.Root
            className={cn(
                "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-main/40",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
                "disabled:opacity-50 data-[state=checked]:bg-brand data-[state=unchecked]:bg-primary shadow-xs dark:shadow-md",
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
