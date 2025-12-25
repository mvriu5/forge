import React, { useState, useEffect, useCallback, useRef } from "react"
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
    range: { from: number, to: number }
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
            editor.chain().focus().deleteRange(range).toggleTaskList().run()
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

const NodeCommandList: React.FC<NodeCommandListProps> = ({ command, editor, range }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [isKeyboardActive, setIsKeyboardActive] = useState(false)
    const itemsRef = useRef<HTMLDivElement>(null)

    const scrollToItem = useCallback((index: number) => {
        if (itemsRef.current && itemsRef.current.children[index]) {
            (itemsRef.current.children[index] as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            })
        }
    }, [])

    const selectItem = useCallback((index: number) => {
        if (defaultCommandItems.length > 0 && defaultCommandItems[0].title !== "No results found") {
            setSelectedIndex(index)
            scrollToItem(index)
        }
    }, [scrollToItem])

    const upHandler = useCallback(() => {
        setIsKeyboardActive(true)
        if (selectedIndex !== null) selectItem((selectedIndex - 1 + defaultCommandItems.length) % defaultCommandItems.length)
        else if (defaultCommandItems.length > 0) selectItem(defaultCommandItems.length - 1)
    }, [selectedIndex, selectItem])

    const downHandler = useCallback(() => {
        setIsKeyboardActive(true)
        if (selectedIndex !== null) selectItem((selectedIndex + 1) % defaultCommandItems.length)
        else if (defaultCommandItems.length > 0) selectItem(0)
    }, [selectedIndex, selectItem])

    const enterHandler = () => {
        if (selectedIndex === null) return false

        const item = defaultCommandItems[selectedIndex]
        if (!item || item.disabled) return false

        if (typeof item.command === "function") item.command({ editor, range })
        else if (typeof command === "function") command(item)
        return true
    }

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                event.preventDefault()
                upHandler()
            } else if (event.key === "ArrowDown") {
                event.preventDefault()
                downHandler()
            } else if (event.key === "Enter") {
                event.preventDefault()
                if (enterHandler()) {
                    event.stopPropagation()
                }
            }
        }

        document.addEventListener("keydown", onKeyDown, true)
        return () => document.removeEventListener("keydown", onKeyDown, true)
    }, [upHandler, downHandler])

    return (
        <div className="flex flex-col bg-primary border border-main/40 rounded-md shadow-xs dark:shadow-md p-1 w-56" ref={itemsRef}>
            {defaultCommandItems.map((item, index) => (
                <button
                    className={cn(
                        "flex items-center gap-2 px-2 py-1",
                        isKeyboardActive && index === selectedIndex && "bg-brand/5 text-brand",
                        item.disabled && ""
                    )}
                    key={item.title}
                    onClick={() => {
                        setIsKeyboardActive(false)
                        if (typeof item.command === "function") item.command({ editor, range })
                        else if (typeof command === "function") command(item)
                    }}
                    onMouseEnter={() => {
                        if (!isKeyboardActive) return
                        setIsKeyboardActive(false)
                        setSelectedIndex(null)
                    }}
                    disabled={item.disabled}
                >
                    {item.icon && item.icon}
                    <span className="text-sm text-secondary">{item.title}</span>
                </button>
            ))}
        </div>
    )
}

export default React.memo(NodeCommandList)
