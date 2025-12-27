import React, { useCallback, useEffect, useRef, useState } from "react"
import { CommandItem } from "./RenderSuggestions"
import {
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Text,
    TextQuote,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NodeCommandListProps {
    command?: (item: CommandItem) => void
    editor: any
    range: { from: number; to: number }
    items?: CommandItem[]
    close?: () => void
    handlePointerDown?: boolean
    onSelect?: (item: CommandItem) => void
}

export const defaultCommandItems: CommandItem[] = [
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <Text size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run()
        },
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckSquare size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().insertContent(" ").run()
        },
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <List size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run()
        },
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <Code size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
    },
]

const NodeCommandList: React.FC<NodeCommandListProps> = ({ command, editor, range, items: itemsProp, close, onSelect, handlePointerDown = true }) => {
    const items = itemsProp && itemsProp.length > 0 ? itemsProp : defaultCommandItems

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [isKeyboardActive, setIsKeyboardActive] = useState(false)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const pointerDownHandledRef = useRef(false)

    const scrollToItem = useCallback((index: number) => {
        const el = containerRef.current
        if (!el) return

        const child = el.children[index] as HTMLElement | undefined
        if (!child) return

        child.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, [])

    const upHandler = useCallback(() => {
        setIsKeyboardActive(true)
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : items.length - 1))
    }, [items.length])

    const downHandler = useCallback(() => {
        setIsKeyboardActive(true)
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : 0))
    }, [items.length])

    const enterHandler = useCallback(() => {
        if (selectedIndex === null) return false

        const item = items[selectedIndex]
        if (!item || item.disabled) return false

        if (typeof item.command === "function") item.command({ editor, range })
        else if (typeof command === "function") command(item)

        onSelect?.(item)
        close?.()
        return true
    }, [selectedIndex, items, editor, range, command, close, onSelect])

    useEffect(() => {
        if (selectedIndex !== null) scrollToItem(selectedIndex)
    }, [selectedIndex, scrollToItem])

    useEffect(() => {
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === "ArrowUp") {
                ev.preventDefault()
                upHandler()
            } else if (ev.key === "ArrowDown") {
                ev.preventDefault()
                downHandler()
            } else if (ev.key === "Enter") {
                ev.preventDefault()
                if (enterHandler()) {
                    ev.stopPropagation()
                }
            }
        }
        document.addEventListener("keydown", onKeyDown, true)
        return () => document.removeEventListener("keydown", onKeyDown, true)
    }, [upHandler, downHandler, enterHandler])

    const getActiveIndex = useCallback(() => {
        if (!editor) return null

        const index = items.findIndex((item) => {
            switch (item.title) {
                case "Text":
                    return editor.isActive("paragraph")
                case "To-do List":
                    return editor.isActive("taskList")
                case "Heading 1":
                    return editor.isActive("heading", { level: 1 })
                case "Heading 2":
                    return editor.isActive("heading", { level: 2 })
                case "Heading 3":
                    return editor.isActive("heading", { level: 3 })
                case "Bullet List":
                    return editor.isActive("bulletList")
                case "Numbered List":
                    return editor.isActive("orderedList")
                case "Quote":
                    return editor.isActive("blockquote")
                case "Code":
                    return editor.isActive("codeBlock")
                default:
                    return false
            }
        })

        return index === -1 ? null : index
    }, [editor, items])

    const syncActiveIndex = useCallback(() => {
        if (isKeyboardActive) return
        setSelectedIndex(getActiveIndex())
    }, [getActiveIndex, isKeyboardActive])

    useEffect(() => {
        syncActiveIndex()
    }, [syncActiveIndex])

    useEffect(() => {
        if (!editor?.on) return

        const handleUpdate = () => {
            syncActiveIndex()
        }

        editor.on("selectionUpdate", handleUpdate)
        editor.on("transaction", handleUpdate)

        return () => {
            editor.off("selectionUpdate", handleUpdate)
            editor.off("transaction", handleUpdate)
        }
    }, [editor, syncActiveIndex])

    return (
        <div
            ref={containerRef}
            role="menu"
            aria-label="Block menu"
            className="flex flex-col bg-primary border border-main/40 rounded-md shadow-xs dark:shadow-md p-1 w-42"
        >
            {items.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                    <button
                        key={item.title + index}
                        type="button"
                        role="menuitem"
                        data-index={index}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1 text-left rounded-md w-full hover:bg-tertiary text-sm text-secondary outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            isSelected && "bg-brand/5 text-brand hover:bg-brand/5",
                            item.disabled && "cursor-not-allowed text-tertiary hover:bg-transparent hover:text-tertiary opacity-50 ",
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => {
                            if (!handlePointerDown) return
                            e.preventDefault()
                            e.stopPropagation()
                            pointerDownHandledRef.current = true
                            if (typeof item.command === "function") item.command({ editor, range })
                            else if (typeof command === "function") command(item)
                            onSelect?.(item)
                            close?.()
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (pointerDownHandledRef.current) {
                                pointerDownHandledRef.current = false
                                return
                            }
                            if (typeof item.command === "function") item.command({ editor, range })
                            else if (typeof command === "function") command(item)
                            onSelect?.(item)
                            close?.()
                        }}
                        onMouseEnter={() => {
                            setIsKeyboardActive(false)
                            setSelectedIndex(index)
                        }}
                        onMouseLeave={() => !isKeyboardActive && setSelectedIndex(getActiveIndex())}
                        disabled={item.disabled}
                    >
                        {item.icon}
                        {item.title}
                    </button>
                )
            })}
        </div>
    )
}

export default React.memo(NodeCommandList)
