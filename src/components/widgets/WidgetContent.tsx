import React, {ReactNode} from "react"
import {cn} from "@/lib/utils"
import {ScrollArea} from "@/components/ui/ScrollArea"

interface WidgetContentProps {
    children: ReactNode
    className?: string
    scroll?: boolean
}

const WidgetContent = ({children, className, scroll = false}: WidgetContentProps) => {

    if (scroll) {
        return (
            <ScrollArea className={cn("h-full", className)} thumbClassname={"bg-white/5"}>
                {children}
            </ScrollArea>
        )
    }

    return (
        <div className={cn("h-full flex flex-col gap-2", className)}>
            {children}
        </div>
    )
}

export {WidgetContent}