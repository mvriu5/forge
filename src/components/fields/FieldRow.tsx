"use client"

import React from "react"
import { FormDescription, FormLabel, FormMessage } from "@/components/ui/Form"
import { cn } from "@/lib/utils"

type FieldRowProps = {
    label: string
    description?: React.ReactNode
    children: React.ReactNode
    className?: string
    innerClassname?: string
}

function FieldRow({ label, description, children, className = "", innerClassname = "" }: FieldRowProps) {
    return (
        <div className={cn("w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2", className)}>
            <div className="w-full flex flex-col justify-center p-0 m-0">
                <FormLabel className="text-secondary">{label}</FormLabel>
                {description && <FormDescription className="text-tertiary text-xs sm:text-md">{description}</FormDescription>}
            </div>

            <div className={cn("w-full sm:w-max flex flex-col gap-2", innerClassname)}>
                {children}
                <FormMessage />
            </div>
        </div>
    )
}

export { FieldRow }
