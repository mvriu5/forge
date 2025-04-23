"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import {cn} from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {}
interface SelectScrollUpProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> {}
interface SelectScrollDownProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> {}
interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}
interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}
interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
    position?: "popper" | "item-aligned"
}

const SelectTrigger = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(({ className, children, ...props }, ref) => {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                "group flex h-8 w-full items-center justify-between gap-2 rounded-md border border-main/60 bg-secondary px-2 py-1 text-sm",
                "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 focus:outline-0",
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown size={12} className="text-secondary group-data-[state=open]:rotate-180 transition-all"/>
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName


const SelectScrollUpButton = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>, SelectScrollUpProps>(({ className, ...props }, ref) => {
    return (
        <SelectPrimitive.ScrollUpButton
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className
            )}
            ref={ref}
            {...props}
        >
            <ChevronUp size={12} className="text-secondary"/>
        </SelectPrimitive.ScrollUpButton>
    )
})
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>, SelectScrollDownProps>(({ className, ...props }, ref) => {
    return (
        <SelectPrimitive.ScrollDownButton
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className
            )}
            ref={ref}
            {...props}
        >
            <ChevronDown size={12} className="text-secondary"/>
        </SelectPrimitive.ScrollDownButton>
    )
})
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Content>, SelectContentProps>(({ className, children, position = "popper", ...props }, ref) => {
    return (
        <SelectPrimitive.Content
            className={cn(
                "relative max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-main",
                "bg-primary text-secondary shadow-md z-50",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
                "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1",
                "data-[side=top]:-translate-y-1",
                className
            )}
            position={position}
            ref={ref}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-1 max-h-[200px]",
                    position === "popper" &&
                    "h-[var(--radix-select-trigger-height)] w-full",
                    "min-w-[var(--radix-select-trigger-width)]"
                )}
            >

                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Label>, SelectLabelProps>(({ className, ...props }, ref) => {
    return (
        <SelectPrimitive.Label
            className={cn("py-1.5 px-2 text-xs text-tertiary", className)}
            ref={ref}
            {...props}
        />
    )
})
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Item>, SelectItemProps>(({ className, children, ...props }, ref) => {
    return (
        <SelectPrimitive.Item
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2",
                "text-sm outline-none focus:bg-secondary focus:text-primary data-[disabled]:pointer-events-none",
                "data-[disabled]:opacity-50",
                className
            )}
            ref={ref}
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
})
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Separator>, SelectSeparatorProps>(({ className, ...props }, ref) => {
    return (
        <SelectPrimitive.Separator
            className={cn("-mx-1 my-1 h-1 border-t border-main", className)}
            ref={ref}
            {...props}
        />
    )
})
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

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