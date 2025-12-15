"use client"

import React from "react"
import {EmojiPicker as FerruccEmojiPicker} from "@ferrucc-io/emoji-picker"

import {Button} from "@/components/ui/Button"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {cn} from "@/lib/utils"

export interface EmojiPickerProps extends React.ComponentPropsWithoutRef<typeof FerruccEmojiPicker> {
    onEmojiSelect: (emoji: string) => void
    onRemove?: () => void
    emojisPerRow?: number
    emojiSize?: number
    searchPlaceholder?: string
    className?: string
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiSelect, onRemove, emojisPerRow = 6, emojiSize = 40, searchPlaceholder = "Search emoji", className, ...props}) => {
    return (
        <FerruccEmojiPicker
            emojisPerRow={emojisPerRow}
            emojiSize={emojiSize}
            onEmojiSelect={onEmojiSelect}
            className={cn("border-0 h-full", className)}
            {...props}
        >
            <FerruccEmojiPicker.Header className={"shadow-md dark:shadow-xl pb-1 flex items-center gap-2 px-2 pt-2"}>
                <FerruccEmojiPicker.Input
                    placeholder={searchPlaceholder}
                    hideIcon
                    className={"px-2 py-1 bg-secondary border border-main/40 rounded-sm flex-1"}
                />
                {onRemove && (
                    <Button
                        variant={"widget"}
                        className={"h-7 hover:bg-error/10 hover:text-error"}
                        onClick={onRemove}
                        type="button"
                    >
                        Remove
                    </Button>
                )}
            </FerruccEmojiPicker.Header>
            <FerruccEmojiPicker.Group>
                <FerruccEmojiPicker.List containerHeight={320} hideStickyHeader/>
            </FerruccEmojiPicker.Group>
        </FerruccEmojiPicker>
    )
}