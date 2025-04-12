"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {}
interface AvatarImageProps extends React.ComponentProps<typeof AvatarPrimitive.Image> {}
interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {}

const Avatar = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Root>, AvatarProps>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        ref={ref}
        {...props}
    />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Image>, AvatarImageProps>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        className={cn("aspect-square h-full w-full", className)}
        ref={ref}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Fallback>, AvatarFallbackProps>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand",
            className
        )}
        ref={ref}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export {
    Avatar,
    AvatarImage,
    AvatarFallback
}
