"use client"

import * as React from "react"
import {Select as SelectPrimitive} from "radix-ui"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import {cn, CONTAINER_STYLES} from "@/lib/utils"
import { ComponentPropsWithRef } from "react"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({ className, children, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Trigger>) => {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                "group flex h-8 w-full items-center justify-between gap-2 rounded-md border border-main/60 bg-secondary px-2 py-1 text-sm",
                "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 focus:outline-0 shadow-xs dark:shadow-md",
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown size={14} className="text-tertiary group-data-[state=open]:rotate-180 group-data-[state=open]:mt-0 transition-all mt-0.5" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
}

const SelectScrollUpButton = ({ className, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.ScrollUpButton>) => {
    return (
        <SelectPrimitive.ScrollUpButton
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className
            )}
            {...props}
        >
            <ChevronUp size={12} className="text-secondary" />
        </SelectPrimitive.ScrollUpButton>
    )
}

const SelectScrollDownButton = ({ className, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.ScrollDownButton>) => {
    return (
        <SelectPrimitive.ScrollDownButton
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className
            )}
            {...props}
        >
            <ChevronDown size={12} className="text-secondary" />
        </SelectPrimitive.ScrollDownButton>
    )
}

const SelectContent = ({ className, children, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Content>) => {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={cn(
                    "max-h-96 z-50 min-w-[8rem] rounded-md border border-main/40",
                    "bg-primary text-secondary shadow-[10px_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] data-[side=bottom]:slide-in-from-top-2",
                    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                    CONTAINER_STYLES.animation,
                    className,
                )}
                position={"popper"}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        "p-1 max-h-[200px]",
                        "h-[var(--radix-select-trigger-height)] w-full",
                        "min-w-[var(--radix-select-trigger-width)]"
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
}

const SelectLabel = ({ className, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Label>) => {
    return (
        <SelectPrimitive.Label
            className={cn("py-1.5 px-2 text-xs text-tertiary", className)}
            {...props}
        />
    )
}

const SelectItem = ({ className, children, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Item>) => {
    return (
        <SelectPrimitive.Item
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2",
                "text-sm outline-none focus:bg-secondary focus:text-primary data-[disabled]:pointer-events-none",
                "data-[disabled]:opacity-50",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>
                {children}
            </SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
}

const SelectSeparator = ({ className, ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Separator>) => {
    return (
        <SelectPrimitive.Separator
            className={cn("-mx-1 my-1 h-1 border-t border-main", className)}
            {...props}
        />
    )
}

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
}

