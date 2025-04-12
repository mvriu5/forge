import {cn} from "@/lib/utils"
import type React from "react"

const Skeleton = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn("animate-pulse rounded-lg bg-black/10 dark:bg-white/5", className)}
            {...props}
        />
    )
}
Skeleton.displayName = "Skeleton"

export { Skeleton }