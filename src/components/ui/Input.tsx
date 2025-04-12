import React from "react"
import {cn} from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-8 w-full rounded-md border border-main bg-primary px-3 py-1 shadow-sm transition-colors file:border-0 text-secondary focus:outline-0" +
                "file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-tertiary focus-visible:outline-0 " +
                "focus-visible:ring focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:ring-brand/40",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }