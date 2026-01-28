"use client"

import { KeyboardShortcut } from "@/components/ui/KeyboardShortcut"
import { CONTAINER_STYLES, cn } from "@/lib/utils"
import { Side } from "@floating-ui/utils"
import { Check, ChevronRightIcon } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import type { ReactNode } from "react"
import * as React from "react"
import { ScrollArea } from "./ScrollArea"

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
    disableFocusOnHover?: boolean
}

interface DropdownMenuLabelProps {
    item: LabelType
    disableFocusOnHover?: boolean
}

interface DropdownMenuCheckboxProps {
    item: CheckboxType
    disableFocusOnHover?: boolean
}

interface DropdownMenuSubItemProps {
    item: SubType
    width?: string
    children: ReactNode
    disableFocusOnHover?: boolean
}

interface DropdownMenuActionsProps {
    items: MenuItem[]
    width?: string
    disableFocusOnHover?: boolean
}

interface DropdownMenuProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {
    onOpenChange?: (open: boolean) => void
    items: MenuItem[]
    asChild?: boolean
    children: ReactNode
    side?: Side
    align?: "center" | "end" | "start" | undefined
    className?: string
    header?: ReactNode
    disableFocusOnHover?: boolean
}

const DropdownMenuItem = ({ item, disableFocusOnHover }: DropdownMenuItemProps) => {
    return (
        <DropdownMenuPrimitive.Item
            onPointerLeave={(event) => disableFocusOnHover && event.preventDefault()}
            onPointerMove={(event) => disableFocusOnHover && event.preventDefault()}
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

const DropdownMenuCheckboxItem = ({item, disableFocusOnHover, ...props}: DropdownMenuCheckboxProps) => {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
            onPointerLeave={(event) => disableFocusOnHover && event.preventDefault()}
            onPointerMove={(event) => disableFocusOnHover && event.preventDefault()}
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

const DropdownMenuSubItem = ({item, width, disableFocusOnHover, children}: DropdownMenuSubItemProps) => {
    return (
        <DropdownMenuPrimitive.Sub>
            <DropdownMenuPrimitive.SubTrigger
                onPointerLeave={(event) => disableFocusOnHover && event.preventDefault()}
                onPointerMove={(event) => disableFocusOnHover && event.preventDefault()}
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

const DropdownMenuActions = ({ items, width, disableFocusOnHover }: DropdownMenuActionsProps) => {
    return items.map((item, i) => {
        const stableKey = (() => {
            if ((item as any).type === 'checkbox') return `checkbox-${(item as any).label}`
            if ((item as any).type === 'item') return `item-${(item as any).label}`
            if ((item as any).type === 'sub') return `sub-${(item as any).label}`
            if ((item as any).type === 'label') return `label-${(item as any).label}`
            return `sep-${i}`
        })()

        if (item.type === "separator") return <DropdownMenuSeparator key={stableKey} />

        if (item.type === "label") return <DropdownMenuLabel key={stableKey} item={item} />

        if (item.type === "checkbox") return <DropdownMenuCheckboxItem key={stableKey} item={item} disableFocusOnHover={disableFocusOnHover} />

        if (item.type === "sub") {
            return (
                <DropdownMenuSubItem key={stableKey} item={item} width={width} disableFocusOnHover={disableFocusOnHover}>
                    <DropdownMenuActions items={item.items} disableFocusOnHover={disableFocusOnHover} />
                </DropdownMenuSubItem>
            )
        }

        return <DropdownMenuItem key={stableKey} item={item} />
    })
}

const DropdownMenu = ({side = "bottom", align = "center", onOpenChange, items, asChild, children, className, header, disableFocusOnHover, ...props}: DropdownMenuProps) => {
    return (
        <DropdownMenuPrimitive.Root onOpenChange={onOpenChange} {...props}>
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
                        "max-h-80 focus:outline-none z-50 flex flex-col",
                        "min-w-[--radix-dropdown-menu-trigger-width]",
                        "bg-primary overflow-hidden rounded-md border border-main/40 p-1 shadow-[10px_10px_20px_rgba(0,0,0,0.2)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)]",
                        CONTAINER_STYLES.animation,
                        className
                    )}
                >
                    {header}
                    <ScrollArea>
                        <div className={cn(header ? "max-h-68" : "h-80")}>
                            <DropdownMenuActions items={items} disableFocusOnHover={disableFocusOnHover} />
                        </div>
                    </ScrollArea>
                </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
    )
}

export {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSubItem,
    type MenuItem
}
