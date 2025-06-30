"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/Dialog"
import {KeyboardShortcut} from "@/components/ui/KeyboardShortcut"
import {ComponentPropsWithRef} from "react"

const Command = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive>) => {
    return (
        <CommandPrimitive
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md bg-primary text-primary border-1 border-main/40",
                className
            )}
            {...props}
        />
    )
}

const CommandDialog = ({children, ...props}: any) => {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 border-0">
                <Command className={cn(
                    "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-secondary",
                    "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5",
                    "[&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3",
                    "[&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                )}
                >
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

const CommandInput = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive.Input>) => {
    return (
        <div className="flex items-center border-b border-main/40 px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                className={cn(
                    "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-tertiary disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    )
}

const CommandList = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive.List>) => {
    return (
        <CommandPrimitive.List
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    )
}

const CommandEmpty = ({...props}: ComponentPropsWithRef<typeof CommandPrimitive.Empty>) => {
    return (
        <CommandPrimitive.Empty
            className="py-6 text-center text-sm"
            {...props}
        />
    )
}

const CommandGroup = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive.Group>) => {
    return (
        <CommandPrimitive.Group
            className={cn(
                "overflow-hidden p-1 text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
                "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-tertiary",
                className
            )}
            {...props}
        />
    )
}

const CommandSeparator = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive.Separator>) => {
    return (
        <CommandPrimitive.Separator
            className={cn("-mx-1 h-px bg-transparent border-b border-main", className)}
            {...props}
        />
    )
}

const CommandItem = ({className, ...props}: ComponentPropsWithRef<typeof CommandPrimitive.Item>) => {
    return (
        <CommandPrimitive.Item
            className={cn(
                "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm text-secondary",
                "outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-secondary data-[selected=true]:text-primary",
                "data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                className
            )}
            {...props}
        />
    )
}

const CommandShortcut = ({title}: {title: string}) => {
    return (
        <KeyboardShortcut keyString={title}/>
    )
}

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator
}