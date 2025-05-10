import { isMacOs } from "react-device-detect"
import {cn} from "@/lib/utils"

type KeyboardShortcutProps = {
    keyString: string
    className?: string
}

function KeyboardShortcut({keyString, className}: KeyboardShortcutProps) {
    const getMetaKey = () => isMacOs ? '⌘ ' : 'Ctrl + '

    return (
        <span className={cn("px-1 rounded-sm bg-tertiary text-tertiary", className)}>
            {getMetaKey() + keyString}
        </span>
    )
}

export { KeyboardShortcut }