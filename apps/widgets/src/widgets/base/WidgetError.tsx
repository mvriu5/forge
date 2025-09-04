import { WidgetContent } from "./WidgetContent"
import {TriangleAlert} from "lucide-react"
import {Callout} from "@forge/ui/components/Callout"
import {Button} from "@forge/ui/components/Button"

interface WidgetErrorProps {
    message: string
    actionLabel?: string
    onAction?: () => void
}

const WidgetError = ({message, actionLabel, onAction}: WidgetErrorProps) => {
    return (
        <WidgetContent>
            <div className="h-full flex flex-col gap-2 items-center justify-center">
                <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                    <TriangleAlert size={32}/>
                    {message}
                </Callout>
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