import { Button } from "@/components/ui/Button"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
import {
    Check,
    ChevronDown,
    Heading1,
    Heading2,
    Heading3,
    TextQuote,
    ListOrdered,
    TextIcon,
    Code,
    CheckSquare,
    type LucideIcon,
} from "lucide-react"
import { EditorBubbleItem, useEditor } from "novel"


export type SelectorItem = {
    name: string
    icon: LucideIcon
    command: (editor: ReturnType<typeof useEditor>["editor"]) => void
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean
}

export const SelectorItems: SelectorItem[] = [
    {
        name: "Text",
        icon: TextIcon,
        command: (editor: any) => editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
        isActive: (editor: any) =>
            editor.isActive("paragraph") &&
            !editor.isActive("bulletList") &&
            !editor.isActive("orderedList")
    },
    {
        name: "Heading 1",
        icon: Heading1,
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (editor: any) => editor.isActive("heading", { level: 1 })
    },
    {
        name: "Heading 2",
        icon: Heading2,
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (editor: any) => editor.isActive("heading", { level: 2 })
    },
    {
        name: "Heading 3",
        icon: Heading3,
        command: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (editor: any) => editor.isActive("heading", { level: 3 })
    },
    {
        name: "To-do List",
        icon: CheckSquare,
        command: (editor: any) => editor.chain().focus().toggleTaskList().run(),
        isActive: (editor: any) => editor.isActive("taskItem")
    },
    {
        name: "Bullet List",
        icon: ListOrdered,
        command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
        isActive: (editor: any) => editor.isActive("bulletList")
    },
    {
        name: "Numbered List",
        icon: ListOrdered,
        command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
        isActive: (editor: any) => editor.isActive("orderedList")
    },
    {
        name: "Quote",
        icon: TextQuote,
        command: (editor: any) =>
            editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
        isActive: (editor: any) => editor.isActive("blockquote")
    },
    {
        name: "Code",
        icon: Code,
        command: (editor: any) => editor.chain().focus().toggleCodeBlock().run(),
        isActive: (editor: any) => editor.isActive("codeBlock")
    },
]
interface NodeSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
    const { editor } = useEditor()
    if (!editor) return null

    const activeItem = SelectorItems.filter((item) => item.isActive(editor)).pop() ?? {name: "Multiple"}

    return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger
                asChild
                className='gap-2 rounded-md border-none hover:bg-secondary focus:ring-0'>
                <Button variant='ghost' className='gap-2'>
                    <span className='whitespace-nowrap text-sm'>{activeItem.name}</span>
                    <ChevronDown className='h-4 w-4' />
                </Button>
            </PopoverTrigger>
            <PopoverContent sideOffset={5} align='start' className={cn('flex flex-col gap-1 w-48 p-1')}>
                {SelectorItems.map((item) => (
                    <EditorBubbleItem
                        key={item.name}
                        onSelect={(editor) => {
                            item.command(editor)
                            onOpenChange(false)
                        }}
                        data-state={activeItem.name === item.name ? "active" : "inactive"}
                        className='group flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm data-[state=active]:bg-secondary hover:bg-secondary'>
                        <div className='flex items-center space-x-2'>
                            <div className='group-data-[state=active]:text-brand rounded-sm border border-main/60 p-1 group-hover:text-brand'>
                                <item.icon className='h-3 w-3 ' />
                            </div>
                            <span className={cn(activeItem.name === item.name && "text-primary")}>{item.name}</span>
                        </div>
                        {activeItem.name === item.name && <Check className='h-4 w-4' />}
                    </EditorBubbleItem>
                ))}
            </PopoverContent>
        </Popover>
    )
}