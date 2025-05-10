"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import {ComponentPropsWithRef} from "react"

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }: ComponentPropsWithRef<typeof TabsPrimitive.List>) => {
    return (
        <TabsPrimitive.List
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-t-md bg-tertiary p-1 text-secondary",
                className
            )}
            {...props}
        />
    )
}

const TabsTrigger = ({ className, ...props }: ComponentPropsWithRef<typeof TabsPrimitive.Trigger>) => {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md h-8 px-3 py-1 text-sm",
                "font-normal ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none",
                "disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary data-[state=active]:shadow",
                className
            )}
            {...props}
        />
    )
}

const TabsContent = ({ className, ...props }: ComponentPropsWithRef<typeof TabsPrimitive.Content>) => {
    return (
        <TabsPrimitive.Content
            className={cn(
                "ring-offset-background focus-visible:outline-none",
                className
            )}
            {...props}
        />
    )
}

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
}
