import {WidgetContent} from "@/components/widgets/base/WidgetContent"

interface WidgetEmptyProps {
    message: string
}

const WidgetEmpty = ({ message }: WidgetEmptyProps) => {
    return (
        <WidgetContent>
            <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-tertiary">{message}</p>
            </div>
        </WidgetContent>
    )
}

export { WidgetEmpty }