"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn, CONTAINER_STYLES } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {}
interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}
interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}
interface DialogCloseProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {}

const DialogOverlay = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Overlay>, DialogProps>(({ className, ...props }, ref) => {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName


const DialogContent = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Content>, DialogContentProps>(({ className, children, ...props }, ref) => {
    return (
        <DialogPrimitive.Portal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                    "gap-4 bg-primary p-6 shadow-lg duration-200 sm:rounded-md border border-main/40",
                    CONTAINER_STYLES.animation,
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogClose = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Close>, DialogCloseProps>(({ className, children, ...props }, ref) => {
    return (
        <DialogPrimitive.Close
            className={cn(
                "rounded-sm opacity-70 transition-opacity hover:opacity-100",
                "focus:outline-none disabled:pointer-events-none text-secondary hover:text-primary"
            )}
            ref={ref}
            {...props}
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
    )
})
DialogClose.displayName = DialogPrimitive.Close.displayName

const DialogHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left text-primary",
                className
            )}
            {...props}
        />
    )
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    )
}
DialogFooter.displayName = "DialogFooter"


const DialogTitle = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Title>, DialogTitleProps>(({ className, ...props }, ref) => {
    return (
        <DialogPrimitive.Title
            className={cn(
                "leading-none tracking-tight",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
DialogTitle.displayName = DialogPrimitive.Title.displayName


const DialogDescription = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Description>, DialogDescriptionProps>(({ className, ...props }, ref) => {
    return (
        <DialogPrimitive.Description
            className={cn(
                "text-sm text-secondary",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
    Dialog,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}