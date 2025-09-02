"use client"

import * as React from "react"
import {Avatar as AvatarPrimitive} from "radix-ui"
import { cn } from "../lib/utils"
import {ComponentPropsWithRef} from "react"

const Avatar = ({ className, ...props }: ComponentPropsWithRef<typeof AvatarPrimitive.Root>) => {
    return (
        <AvatarPrimitive.Root
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                className
            )}
            {...props}
        />
    )
}

const AvatarImage = ({ className, ...props }: ComponentPropsWithRef<typeof AvatarPrimitive.Image>) => {
    return (
        <AvatarPrimitive.Image
            className={cn("aspect-square h-full w-full", className)}
            {...props}
        />
    )
}

const AvatarFallback = ({ className, ...props }: ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>) => {
    return (
        <AvatarPrimitive.Fallback
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand",
                className
            )}
            {...props}
        />
    )
}

export {
    Avatar,
    AvatarImage,
    AvatarFallback
}
