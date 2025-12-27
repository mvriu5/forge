import { Button } from "@/components/ui/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
import type { Editor } from "@tiptap/core"
import { BoldIcon, ChevronDown, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react"
import { useEffect, useState } from "react"
import NodeCommandList from "./NodeCommandList"

export type SelectorItem = {
    name: string
    icon: React.ComponentType<{ size?: number, className?: string }>
    command: (editor: Editor) => void
    isActive: (editor: Editor) => boolean
}

export const TextButtons = ({ editor, range }: { editor: Editor | null, range: { from: number, to: number } }) => {
    const [commandMenuOpen, setCommandMenuOpen] = useState(false)
    const [commandRange, setCommandRange] = useState(range)
    const [selectedCommandTitle, setSelectedCommandTitle] = useState<string | null>(null)

    if (!editor) return null

    const items: SelectorItem[] = [
        {
            name: "bold",
            isActive: (editor: any) => editor.isActive("bold"),
            command: (editor: any) => editor.chain().focus().toggleBold().run(),
            icon: BoldIcon,
        },
        {
            name: "italic",
            isActive: (editor: any) => editor.isActive("italic"),
            command: (editor: any) => editor.chain().focus().toggleItalic().run(),
            icon: ItalicIcon,
        },
        {
            name: "underline",
            isActive: (editor: any) => editor.isActive("underline"),
            command: (editor: any) => editor.chain().focus().toggleUnderline().run(),
            icon: UnderlineIcon,
        },
        {
            name: "strike",
            isActive: (editor: any) => editor.isActive("strike"),
            command: (editor: any) => editor.chain().focus().toggleStrike().run(),
            icon: StrikethroughIcon,
        },
        {
            name: "code",
            isActive: (editor: any) => editor.isActive("code"),
            command: (editor: any) => editor.chain().focus().toggleCode().run(),
            icon: CodeIcon,
        }
    ]

    return (
        <div className="flex rounded-md bg-primary shadow-xs dark:shadow-md border border-main/40">
            <Popover
                open={commandMenuOpen}
                onOpenChange={(isOpen) => {
                    if (isOpen) {
                        const position = editor.state.selection.to
                        setCommandRange({ from: position, to: position })
                    }
                    setCommandMenuOpen(isOpen)
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        className="rounded-r-none px-2 border-0 text-sm gap-1"
                    >
                        {selectedCommandTitle ?? "Command"}
                        <ChevronDown size={16} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align={"start"} className="p-0 border-0" portalled={false}>
                    <NodeCommandList
                        editor={editor}
                        range={commandRange}
                        close={() => setCommandMenuOpen(false)}
                        command={(item: any) => {
                            if (item?.title) setSelectedCommandTitle(item.title)
                            setCommandMenuOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
            {items.map((item) => (
                <Button
                    key={item.name}
                    className={cn("rounded-none px-2", item.isActive(editor) && "bg-tertiary text-primary border border-main/20")}
                    variant="ghost"
                    onClick={() => {
                        setCommandMenuOpen(false)
                        item.command(editor)
                    }}
                    aria-pressed={item.isActive(editor) ? "true" : "false"}
                >
                    <item.icon
                        className={cn(item.isActive(editor) && "text-brand")}
                        size={16}
                    />
                </Button>
            ))}
        </div>
    )
}
