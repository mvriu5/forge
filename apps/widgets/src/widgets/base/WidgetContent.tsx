import {cn} from "@forge/ui/lib/utils"
import {HTMLAttributes} from "react"
import {ScrollArea} from "@forge/ui/components/ScrollArea"

interface WidgetContentProps extends HTMLAttributes<HTMLDivElement> {
    scroll?: boolean
}

const WidgetContent = ({children, className, scroll = false}: WidgetContentProps) => {

    if (scroll) {
        return (
            <ScrollArea className={cn("h-full max-h-[400px]", className)} thumbClassname={"bg-black/5 dark:bg-white/5"}>
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