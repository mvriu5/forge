"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {}
interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {}

const RadioGroup = React.forwardRef<React.ComponentRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn("grid gap-4", className)}
            ref={ref}
            {...props}
        />
    )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<React.ComponentRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-main text-primary focus:outline-none",
                "focus-visible:ring-1 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-3.5 w-3.5 fill-brand " />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export {
    RadioGroup,
    RadioGroupItem
}