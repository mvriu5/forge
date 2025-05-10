import {cn} from "@/lib/utils"
import {HTMLAttributes} from "react"

const Skeleton = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn("animate-pulse rounded-lg bg-black/10 dark:bg-white/5", className)}
            {...props}
        />
    )
}

export { Skeleton }