"use client"

import * as React from "react"
import {Dialog as DialogPrimitive} from "radix-ui"
import { X } from "lucide-react"
import { cn, CONTAINER_STYLES } from "@/lib/utils"
import { ComponentPropsWithRef } from "react"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export const DialogOverlay = ({ className, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Overlay>) => (
    <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={cn(
            "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export const DialogContent = ({ className, children, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Content>) => (
    <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
            data-slot="dialog-content"
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                "gap-4 bg-primary p-6 shadow-[10px_10px_20px_rgba(0,0,0,0.5)] duration-200 rounded-md border border-main/40",
                CONTAINER_STYLES.animation,
                className
            )}
            {...props}
        >
            {children}
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
)
DialogContent.displayName = DialogPrimitive.Content.displayName

export const DialogClose = ({ iconSize = 16, className, children, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Close> & {iconSize?: number}) => (
    <DialogPrimitive.Close
        data-slot="dialog-close"
        className={cn(
            "rounded-sm opacity-70 transition-opacity hover:opacity-100",
            "focus:outline-none disabled:pointer-events-none text-secondary hover:text-primary",
            className
        )}
        {...props}
    >
        <X size={iconSize} />
        <span className="sr-only">Close</span>
        {children}
    </DialogPrimitive.Close>
)
DialogClose.displayName = DialogPrimitive.Close.displayName

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        data-slot="dialog-header"
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left text-primary",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        data-slot="dialog-footer"
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

export const DialogTitle = ({ className, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Title>) => (
    <DialogPrimitive.Title
        data-slot="dialog-title"
        className={cn(
            "leading-none tracking-tight",
            className
        )}
        {...props}
    />
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

export const DialogDescription = ({ className, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Description>) => (
    <DialogPrimitive.Description
        data-slot="dialog-description"
        className={cn(
            "text-sm text-secondary",
            className
        )}
        {...props}
    />
)
DialogDescription.displayName = DialogPrimitive.Description.displayName
