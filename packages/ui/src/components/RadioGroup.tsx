"use client"

import {RadioGroup as RadioGroupPrimitive} from "radix-ui"
import { Circle } from "lucide-react"
import { cn } from "../lib/utils"
import {ComponentPropsWithRef} from "react"

const RadioGroup = ({ className, ...props }: ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn("grid gap-4", className)}
            {...props}
        />
    )
}

const RadioGroupItem =  ({ className, ...props }: ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>) => {
    return (
        <RadioGroupPrimitive.Item
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-main text-primary focus:outline-none",
                "focus-visible:ring-1 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-3.5 w-3.5 fill-brand/60 dark:fill-brand" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
}

export {
    RadioGroup,
    RadioGroupItem
}