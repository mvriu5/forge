import React, {ComponentPropsWithRef} from "react"
import {cn} from "@/lib/utils"

const Input = ({ className, type, ...props }: ComponentPropsWithRef<"input">) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-8 w-full rounded-md border border-main/60 bg-primary px-3 py-1 shadow-md transition-colors file:border-0 text-secondary focus:outline-0" +
                "file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-tertiary focus-visible:outline-0 " +
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:border-brand",
                className
            )}
            {...props}
        />
    )
}

export { Input }