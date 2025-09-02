"use client"

import * as React from "react"
import {DropdownMenu as DropdownMenuPrimitive} from "radix-ui"
import {Check, ChevronRightIcon} from "lucide-react"
import type { ReactNode } from "react"
import {KeyboardShortcut} from "../components/KeyboardShortcut"
import {CONTAINER_STYLES, cn} from "../lib/utils"
import {Side} from "@floating-ui/utils"

interface ItemType {
    type: 'item'
    label: string
    shortcut?: string
    icon?: ReactNode
    onSelect?: () => void
}

interface SubType {
    type: 'sub'
    label: string
    items: MenuItem[]
    icon?: ReactNode
}

interface LabelType {
    type: 'label'
    label: string
}

interface CheckboxType {
    type: 'checkbox'
    icon?: ReactNode
    label: string
    checked: boolean
    onCheckedChange?: (checked: boolean) => void
}

interface SeparatorType {
    type: 'separator'
}

type MenuItem = ItemType | SubType | LabelType | CheckboxType | SeparatorType

interface DropdownMenuItemProps {
    item: ItemType
}

interface DropdownMenuLabelProps {
    item: LabelType
}

interface DropdownMenuCheckboxProps {
    item: CheckboxType
}

interface DropdownMenuSubItemProps {
    item: SubType
    width?: string
    children: ReactNode
}

interface DropdownMenuActionsProps {
    items: MenuItem[]
    width?: string
}

interface DropdownMenuProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {
    onOpenChange?: (open: boolean) => void
    items: MenuItem[]
    asChild?: boolean
    children: ReactNode
    side?: Side
    align?: "center" | "end" | "start" | undefined
    className?: string
}

const DropdownMenuItem = ({ item }: DropdownMenuItemProps) => {
    return (
        <DropdownMenuPrimitive.Item
            onSelect={item.onSelect}
            className={cn(
                "text-sm border-0 hover:bg-secondary outline-0 px-2 py-1 rounded-md cursor-pointer",
                "flex items-center gap-2 hover:text-primary"
            )}
        >
            {item.icon}
            <p>{item.label}</p>
            {item.shortcut && <KeyboardShortcut keyString={item.shortcut}/>}
        </DropdownMenuPrimitive.Item>
    )
}

const DropdownMenuLabel = ({item}: DropdownMenuLabelProps) => {
    return (
        <DropdownMenuPrimitive.Label
            className={cn("text-xs text-tertiary p-1")}
        >
            {item.label}
        </DropdownMenuPrimitive.Label>
    )
}

const DropdownMenuCheckboxItem = ({item, ...props}: DropdownMenuCheckboxProps) => {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
            className={cn(
                "flex items-center gap-2 text-sm border-0 hover:bg-secondary outline-0 px-2 py-1",
                "rounded-md cursor-pointer hover:text-primary",
            )}
            {...props}
        >
            {item.icon}
            {item.label}
            <DropdownMenuPrimitive.ItemIndicator>
                <Check className="mr-1" size={14}/>
            </DropdownMenuPrimitive.ItemIndicator>
        </DropdownMenuPrimitive.CheckboxItem>
    )
}

const DropdownMenuSeparator = () => {
    return (
        <DropdownMenuPrimitive.Separator
            className={cn("-mx-1 my-1 h-0 border-b border-main")}
        />
    )
}

const DropdownMenuSubItem = ({item, width, children}: DropdownMenuSubItemProps) => {
    return (
        <DropdownMenuPrimitive.Sub>
            <DropdownMenuPrimitive.SubTrigger
                className={cn(
                    "text-sm border-0 hover:bg-secondary outline-0 px-2 py-1 rounded-md cursor-pointer",
                    "flex space-x-2 items-center hover:text-primary"
                )}
            >
                {item.icon}
                <DropdownMenuPrimitive.Label className="flex-1">
                    {item.label}
                </DropdownMenuPrimitive.Label>
                <ChevronRightIcon size={14}/>
            </DropdownMenuPrimitive.SubTrigger>
            <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.SubContent
                    sideOffset={8}
                    alignOffset={-4}
                    className={cn(
                        "bg-primary max-h-[--radix-dropdown-menu-content-available-height]",
                        "min-w-[--radix-dropdown-menu-trigger-width]",
                        "overflow-y-auto rounded-md border border-main p-1 shadow-md",
                        CONTAINER_STYLES.animation,
                        width
                    )}
                >
                    {children}
                </DropdownMenuPrimitive.SubContent>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Sub>
    )
}

const DropdownMenuActions = ({ items, width }: DropdownMenuActionsProps) => {
    return items.map((item, i) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        if (item.type === "separator") return <DropdownMenuSeparator key={i} />

        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        if (item.type === "label") return <DropdownMenuLabel key={i} item={item} />

        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        if (item.type === "checkbox") return <DropdownMenuCheckboxItem key={i} item={item} />

        if (item.type === "sub") {
            return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <DropdownMenuSubItem key={i} item={item} width={width}>
                    <DropdownMenuActions items={item.items} />
                </DropdownMenuSubItem>
            )
        }

        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        return <DropdownMenuItem key={i} item={item} />
    })
}

const DropdownMenu = ({side = "bottom", align = "center", onOpenChange, items, asChild, children, className}: DropdownMenuProps) => {
    return (
        <DropdownMenuPrimitive.Root onOpenChange={onOpenChange}>
            <DropdownMenuPrimitive.Trigger asChild={asChild}>
                {children}
            </DropdownMenuPrimitive.Trigger>
            <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                    collisionPadding={8}
                    sideOffset={8}
                    side={side}
                    align={align}
                    className={cn(
                        "focus:outline-none z-50",
                        "max-h-[--radix-dropdown-menu-content-available-height]",
                        "min-w-[--radix-dropdown-menu-trigger-width]",
                        "bg-primary overflow-y-auto rounded-md border border-main/60 p-1 shadow-[10px_10px_20px_rgba(0,0,0,0.2)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)]",
                        CONTAINER_STYLES.animation,
                        className
                    )}
                >
                    <DropdownMenuActions items={items} />
                </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
    )
}

export {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSubItem,
    type MenuItem
}
