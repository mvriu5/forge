import React, {ReactNode} from "react"
import {cn} from "@/lib/utils"

interface WidgetHeaderProps {
    children?: ReactNode
    title?: string
    icon?: ReactNode
    className?: string
}

const WidgetHeader = ({children, title, icon, className}: WidgetHeaderProps) => {
    return (
        <div className={cn("flex items-center justify-between gap-2", !title && !icon && "justify-normal", className)}>
            <div className={cn("flex items-center gap-2", !title && !icon && "hidden")}>
                {icon}
                <p className={"text-primary text-md font-medium truncate"}>{title}</p>
            </div>
            <div className={cn("flex items-center gap-2", !title && !icon && "w-full")}>
                {children}
            </div>
        </div>
    )
}

export {WidgetHeader}