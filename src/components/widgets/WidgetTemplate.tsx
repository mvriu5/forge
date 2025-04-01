import React, {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"

interface WidgetTemplateProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({className, children}) => {

    return (
        <div className={cn("col-span-2 row-span-2 rounded-md bg-tertiary border border-main/40 p-4 overflow-hidden", className)}>
            {children}
        </div>
    )
}

export { WidgetTemplate }