import { ScrollArea } from "@/components/ui/ScrollArea"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface WidgetContentProps {
    children: ReactNode
    className?: string
    scroll?: boolean
}

const WidgetContent = ({children, className, scroll = false}: WidgetContentProps) => {
    if (scroll) {
        return (
            <ScrollArea className={cn("h-full max-h-100", className)} thumbClassname={"bg-black/5 dark:bg-white/5"}>
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

export { WidgetContent }
