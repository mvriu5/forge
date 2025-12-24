import { cn } from "@/lib/utils"
import type { Editor } from "@tiptap/core"
import {BoldIcon, ItalicIcon, StrikethroughIcon, CodeIcon, UnderlineIcon} from "lucide-react"
import {SelectorItem} from "@/components/widgets/components/NodeSelector"
import {Button} from "@/components/ui/Button"

export const TextButtons = ({ editor }: { editor?: Editor | any }) => {
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
            command: (editor: any) => editor.chain().focus().toggle().run(),
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
            {items.map((item) => (
                <Button
                    key={item.name}
                    className={cn("rounded-md px-2", item.isActive(editor) && "bg-tertiary text-primary")}
                    variant="ghost"
                    onClick={() => item.command(editor)}
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
