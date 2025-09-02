"use client"

import { cn } from "../lib/utils"
import {Checkbox as CheckboxPrimitive} from "radix-ui"
import * as React from "react"
import {Check} from "lucide-react"
import {cva, type VariantProps} from "class-variance-authority"

const checkboxVariants = cva(
    "peer shrink-0 border border-main ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary",
    {
        variants: {
            size: {
                sm: "h-4 w-4 rounded-sm",
                md: "h-5 w-5 rounded-md",
                lg: "h-6 w-6 rounded-md"
            }
        },
        defaultVariants: {
            size: "md"
        }
    })

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants>{}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(({size, className, ...props}, ref) => {
    return (
        <CheckboxPrimitive.Root
            className={cn(checkboxVariants({ size }), className)}
            ref={ref}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                className={cn("flex items-center justify-center text-current")}
            >
                <Check size={size === "sm" ? 10 : (size === "md" ? 12 : 14)} strokeWidth={3}/>
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }