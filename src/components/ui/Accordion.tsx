"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import type {ComponentPropsWithRef, ReactNode} from "react"

const Accordion = AccordionPrimitive.Root

const AccordionItem = ({ title, children, className, ...props }: ComponentPropsWithRef<typeof AccordionPrimitive.Item & {title: string}>) => {
    return (
        <>
            <AccordionPrimitive.Item
                className={cn("", className)}
                {...props}
            >
                <AccordionPrimitive.Header
                    className="flex px-2 rounded-t-md data-[state=open]:text-primary data-[state=open]:bg-tertiary">
                    <AccordionPrimitive.Trigger
                        className={cn(
                            "flex flex-1 items-center justify-between py-2 font-medium transition-all",
                            "[&[data-state=open]>svg]:rotate-180",
                            className
                        )}
                    >
                        {title}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200"/>
                    </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                {children}
                <div className={"h-2 border-b border-main mb-2"}/>
            </AccordionPrimitive.Item>
        </>
    )
}

const AccordionContent = ({ className, children, ...props }: ComponentPropsWithRef<typeof AccordionPrimitive.Content>) => {
    return (
        <AccordionPrimitive.Content
            className={cn(
                "overflow-hidden text-sm data-[state=open]:bg-tertiary px-2 rounded-b-md",
                "transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            )}
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>
                {children}
            </div>
        </AccordionPrimitive.Content>
    )
}

export {
    Accordion,
    AccordionItem,
    AccordionContent
}