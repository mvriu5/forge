import React, {ComponentPropsWithRef} from "react"
import {cn} from "@/lib/utils"

const Input = ({ className, type, ...props }: ComponentPropsWithRef<"input">) => {
    return (
        <input
            type={type}
            spellCheck={false}
            className={cn(
                "flex h-8 w-full rounded-md outline-0 border border-main/60 bg-primary px-3 py-1",
                "shadow-xs dark:shadow-md transition-colors file:border-0 text-secondary",
                "file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-tertiary",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ",
                "focus:border-brand focus:bg-brand/5 focus:outline focus:outline-brand/60",
                className
            )}
            {...props}
        />
    )
}

export { Input }