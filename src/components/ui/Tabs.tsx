"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}
interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}
interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(({ className, ...props }, ref) => {
    return (
        <TabsPrimitive.List
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-t-md bg-tertiary p-1 text-secondary",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(({ className, ...props }, ref) => {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md h-8 px-3 py-1 text-sm",
                "font-normal ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none",
                "disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary data-[state=active]:shadow",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Content>, TabsContentProps>(({ className, ...props }, ref) => {
    return (
        <TabsPrimitive.Content
            className={cn(
                "ring-offset-background focus-visible:outline-none",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
}
