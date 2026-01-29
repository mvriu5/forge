"use client"

import { cn } from "@/lib/utils"
import { EmojiPicker as Emoji } from "frimousse"
import React, { useState } from "react"
import { Button } from "./Button"
import { Trash, TrashIcon } from "lucide-react"
import { ScrollArea } from "./ScrollArea"

export interface EmojiPickerProps {
    onEmojiSelect: (emoji: { emoji: string, label: string }) => void
    onRemove?: () => void
    emojisPerRow?: number
    searchPlaceholder?: string
    className?: string
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiSelect, onRemove, emojisPerRow = 6, searchPlaceholder = "Search emoji", className, ...props}) => {
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

    const handleEmojiSelect = (emoji: { emoji: string, label: string }) => {
        setSelectedEmoji(emoji.emoji)
        onEmojiSelect(emoji)
    }

    const handleRemove = () => {
        setSelectedEmoji(null)
        onRemove?.()
    }

    return (
        <Emoji.Root
            className={cn("isolate flex h-80 w-max flex-col bg-primary rounded-md", className)}
            onEmojiSelect={handleEmojiSelect}
            columns={emojisPerRow}
        >
            <div className="flex items-center gap-2 pt-2 px-2">
                <Emoji.Search
                    className={cn(
                        "z-10 appearance-none flex h-8 w-full rounded-md outline-0 border border-main/60 bg-primary",
                        "px-3 py-1 shadow-xs dark:shadow-md transition-colors file:border-0 text-secondary",
                        "file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-tertiary",
                        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ",
                        "focus:border-brand focus:bg-brand/5 focus:outline focus:outline-brand/60"
                    )}
                    placeholder={searchPlaceholder}
                />
                {onRemove &&
                    <Button onClick={handleRemove} className="px-1.5 bg-error/10 text-error border-error/20 hover:bg-error/20 hover:text-error">
                        <Trash size={16}/>
                    </Button>
                }
            </div>
            <Emoji.Viewport className="relative flex-1 outline-hidden">
                <Emoji.Loading className="absolute inset-0 flex items-center justify-center text-tertiary text-sm">
                    Loading…
                </Emoji.Loading>
                <Emoji.Empty className="absolute inset-0 flex items-center justify-center text-tertiary text-sm">
                    No emoji found.
                </Emoji.Empty>
                <Emoji.List
                    className="select-none pb-1.5"
                    components={{
                        CategoryHeader: ({ category, ...props }) => (
                            <div
                                className="px-3 pt-3 pb-1.5 font-medium bg-primary text-xs text-secondary"
                                {...props}
                            >
                                {category.label}
                            </div>
                        ),
                        Row: ({ children, ...props }) => (
                            <div className="scroll-my-1.5 px-1.5" {...props}>
                                {children}
                            </div>
                        ),
                        Emoji: ({ emoji, ...props }) => (
                            <button
                                className="flex size-8 items-center justify-center rounded-md text-lg data-active:bg-tertiary"
                                {...props}
                            >
                                {emoji.emoji}
                            </button>
                        ),
                    }}
                />
            </Emoji.Viewport>
        </Emoji.Root>
    )
}
