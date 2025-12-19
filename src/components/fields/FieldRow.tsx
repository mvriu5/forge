"use client"

import React from "react"
import { FormDescription, FormLabel, FormMessage } from "@/components/ui/Form"

type FieldRowProps = {
    label: string
    description?: React.ReactNode
    children: React.ReactNode
    className?: string
}

function FieldRow({ label, description, children, className = "" }: FieldRowProps) {
    return (
        <div className={`${className} w-full flex items-center justify-between gap-2`}>
        <div className="w-full flex flex-col justify-center p-0 m-0">
            <FormLabel className="text-secondary">{label}</FormLabel>
            {description && <FormDescription className="text-tertiary">{description}</FormDescription>}
        </div>

        <div className="flex flex-col gap-2">
            {children}
            <FormMessage />
        </div>
    </div>
    )
}

export { FieldRow }
