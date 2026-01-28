import { cn } from "@/lib/utils"
import React from "react"

type ThemeVariant = "light" | "dark" | "system"

interface ThemeOptionProps extends React.HTMLAttributes<HTMLDivElement> {
    variant: ThemeVariant
    selected?: boolean
}

function ThemeOption({ variant, selected = false, className, onClick, ...rest }: ThemeOptionProps) {
    const baseCommon = "shadow-xs dark:shadow-md rounded-lg border border-main/40 h-12 w-16 flex items-stretch"

    if (variant === "light") {
        return (
            <div
                role="button"
                aria-pressed={selected}
                className={cn(
                    "shadow-xs dark:shadow-md rounded-lg bg-[#ebebeb] border border-main/40 h-12 w-16 p-1 flex flex-col gap-1",
                    selected && "ring-2 ring-brand",
                    className
                )}
                onClick={onClick}
                {...rest}
            >
                <div className="h-3 w-10 bg-info/30 rounded-md" />
                <div className="h-2 w-12 bg-[#0a0a0a]/10 rounded-md" />
                <div className="h-3 w-8 bg-error/30 rounded-md" />
            </div>
        )
    }

    if (variant === "dark") {
        return (
            <div
                role="button"
                aria-pressed={selected}
                className={cn(
                "shadow-xs dark:shadow-md rounded-lg bg-[#0a0a0a] border border-main/40 h-12 w-16 p-1 flex flex-col gap-1",
                selected && "ring-2 ring-brand",
                className
                )}
                onClick={onClick}
                {...rest}
            >
                <div className="h-3 w-10 bg-info/20 dark:bg-info/10 rounded-md" />
                <div className="h-2 w-12 bg-[#ebebeb]/15 dark:bg-[#ebebeb]/5 rounded-md" />
                <div className="h-3 w-8 bg-error/20 dark:bg-error/10 rounded-md" />
            </div>
        )
    }

    return (
        <div
            role="button"
            aria-pressed={selected}
            className={cn(baseCommon, selected && "ring-2 ring-brand", className)}
            onClick={onClick}
            {...rest}
        >
            <div className="h-full w-1/2 rounded-l-lg bg-[#ebebeb] p-1 flex flex-col gap-1">
            <div className="h-3 w-10 bg-info/30 rounded-md" />
            <div className="h-2 w-12 bg-[#0a0a0a]/10 rounded-md" />
            <div className="h-3 w-8 bg-error/30 rounded-md" />
            </div>
            <div className="h-full w-1/2 rounded-r-lg bg-[#0a0a0a] p-1 pl-0 flex flex-col gap-1">
            <div className="h-3 w-3 bg-info/20 dark:bg-info/10 rounded-r-md" />
            <div className="h-2 w-5 bg-[#ebebeb]/15 dark:bg-[#ebebeb]/5 rounded-r-md" />
            <div className="h-3 w-1 bg-error/20 dark:bg-error/10 rounded-r-md" />
            </div>
        </div>
    )
}

export { ThemeOption }
