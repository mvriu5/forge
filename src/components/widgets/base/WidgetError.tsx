import { Button } from "@/components/ui/Button"
import { Callout } from "@/components/ui/Callout"
import { TriangleAlert } from "lucide-react"
import { WidgetContent } from "./WidgetContent"

interface WidgetErrorProps {
    message: string
    details?: string
    actionLabel?: string
    onAction?: () => void
}

const WidgetError = ({message, details, actionLabel, onAction}: WidgetErrorProps) => {
    return (
        <WidgetContent>
            <div className="h-full flex flex-col gap-2 items-center justify-center">
                <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                    <TriangleAlert size={32}/>
                    {message}
                </Callout>
                <p className={"text-tertiary text-xs"}>
                    {details}
                </p>
                {actionLabel && onAction && (
                    <Button className="mt-2" onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}
            </div>
        </WidgetContent>
    )
}

export { WidgetError }
