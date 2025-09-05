import {BoldIcon, ItalicIcon, StrikethroughIcon, CodeIcon} from "lucide-react"
import {EditorBubbleItem, useEditor} from "novel"
import { SelectorItem } from "./NodeSelector"
import {Button} from "@forge/ui/components/Button"
import {cn} from "@forge/ui/lib/utils"

export const TextButtons = () => {
    const { editor } = useEditor()
    if (!editor) return null;
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
        /*{
            name: "underline",
            isActive: (editor: any) => editor.isActive("underline"),
            command: (editor: any) => editor.chain().focus().toggle().run(),
            icon: UnderlineIcon,
        },*/
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
        },
    ];
    return (
        <div className="flex">
            {items.map((item) => (
                <EditorBubbleItem
                    key={item.name}
                    className={"group"}
                    onSelect={(editor) => {
                        item.command(editor);
                    }}>
                    <Button className="rounded-none group:last:rounded-r-md px-2" variant="ghost">
                        <item.icon
                            className={cn(item.isActive(editor) && "text-brand")}
                            size={16}
                        />
                    </Button>
                </EditorBubbleItem>
            ))}
        </div>
    );
};