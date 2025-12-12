"use client"

import React, {useEffect, useState} from "react"
import {
    EditorBubble,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    EditorInstance,
    EditorRoot,
    handleCommandNavigation,
    JSONContent
} from "novel"
import {defaultExtensions} from "@/lib/extensions"
import {slashCommand, suggestionItems} from "@/components/widgets/components/SlashCommand"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {NodeSelector} from "./components/NodeSelector"
import {TextButtons} from "@/components/widgets/components/TextButtons"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import AutoJoiner from "tiptap-extension-auto-joiner"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../ui/Dialog"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {Input} from "@/components/ui/Input"
import {File, Plus, Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {EmojiPicker} from "@ferrucc-io/emoji-picker"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {cn, getUpdateTimeLabel} from "@/lib/utils"
import {defineWidget, WidgetProps } from "@tryforgeio/sdk"

type Note = {
    id: string
    title: string
    content: JSONContent
    emoji: string
    lastUpdated: Date
}

interface EditorConfig {
    notes: Note[]
}

const EditorWidget: React.FC<WidgetProps<EditorConfig>> = ({config, updateConfig}) => {
    const [openNoteId, setOpenNoteId] = useState<string | null>(null)

    const addTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new note",
        anchor: "tc"
    })

    const createNewNote = () => {
        const newNote: Note = {
            id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: "",
            content: {} as JSONContent,
            emoji: "",
            lastUpdated: new Date()
        }
        setOpenNoteId(newNote.id)
    }

    const handleSave = async (id: string, data: { title: string, content: JSONContent, emoji: string, lastUpdated: Date }) => {
        await updateConfig(prev => ({
            ...prev,
            notes: prev.notes.map(note =>
                note.id === id ? { ...note, ...data } : note,
            ),
        }))
    }

    const handleDelete = async (id: string) => {
        await updateConfig(prev => ({
            ...prev,
            notes: prev.notes.filter(note => note.id !== id),
        }))
    }

    return (
        <>
            <WidgetHeader title={"Notes"}>
                <Button
                    variant={"widget"}
                    className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                    onClick={createNewNote}
                    {...addTooltip}
                >
                    <Plus size={16}/>
                </Button>
            </WidgetHeader>
            {config.notes.length === 0 && <WidgetEmpty message={"No notes available. Create a new note to get started."}/>}
            <WidgetContent scroll>
                <div className={"flex flex-col gap-2"}>
                    {config.notes.map((note: Note) => (
                        <NoteDialog
                            key={note.id}
                            note={note}
                            open={openNoteId === note.id}
                            onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                            onSave={(id, data) => handleSave(id, data)}
                            onDelete={(id) => handleDelete(id)}
                        />
                    ))}
                </div>
            </WidgetContent>
        </>
    )
}

interface NoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    note: Note
    onSave: (id: string, data: { title: string, content: JSONContent, emoji: string, lastUpdated: Date }) => void
    onDelete: (id: string) => void
}

const NoteDialog: React.FC<NoteDialogProps> = ({open, onOpenChange, note, onSave, onDelete}) => {
    const [title, setTitle] = useState(note.title)
    const [emoji, setEmoji] = useState(note.emoji)
    const [openNode, setOpenNode] = useState(false)
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [_, setSaved] = useState(true)
    const [__, setIsSaving] = useState(false)

    useEffect(() => {
        setTitle(note.title)
        setEmoji(note.emoji)
    }, [note.title, note.emoji])

    const extensions = [
        GlobalDragHandle.configure({
            dragHandleWidth: 20,
            scrollTreshold: 100,
        }),
        AutoJoiner.configure({
            elementsToJoin: ["bulletList", "orderedList"]
        }),
        ...defaultExtensions,
        slashCommand
    ]

    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html")
        // biome-ignore lint/complexity/noForEach: <explanation>
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        })
        return new XMLSerializer().serializeToString(doc)
    }

    const handleTitleBlur = () => {
        if (title !== note.title) {
            onSave(note.id, { title, content: note.content as any, emoji: note.emoji, lastUpdated: new Date() })
            setSaved(true)
        }
    }

    const handleEmojiSelect = (emoji: string) => {
        setEmoji(emoji)
        onSave(note.id, { title, content: note.content as any, emoji, lastUpdated: new Date() })
        setSaved(true)
        setEmojiPickerOpen(false)
    }

    const handleRemoveEmoji = () => {
        setEmoji("")
        onSave(note.id, { title, content: note.content as any, emoji: "", lastUpdated: new Date() })
        setSaved(true)
        setEmojiPickerOpen(false)
    }

    const handleSave = async (editor: EditorInstance) => {
        setIsSaving(true)

        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))

        onSave(note.id, { title, content: json, emoji, lastUpdated: new Date() })
        setSaved(true)
        setIsSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogTrigger asChild>
                <div className={"group w-full p-1 flex items-center justify-between cursor-pointer text-primary rounded-md hover:bg-secondary"}>
                    <div className="flex items-center gap-2">
                        <div className={"text-2xl p-1 ml-1 rounded-md bg-black/5 dark:bg-white/5 text-primary flex items-center justify-center"}>
                            {emoji?.length > 0 ? emoji : <div className={"size-8 flex items-center justify-center"}><File size={24}/></div>}
                        </div>
                        <div className={"flex flex-col gap-1"}>
                            {note.title && note.title.trim().length > 0 ? note.title : "No title"}
                            <p className={"text-tertiary font-mono text-sm"}>
                                {getUpdateTimeLabel(note.lastUpdated)}
                            </p>
                        </div>
                    </div>

                    <Button
                        className={"hidden group-hover:flex px-1 h-6 mx-2"}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(note.id)
                        }}
                    >
                        <Trash size={14}/>
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className={"md:min-w-[800px] h-full max-h-[80vh] w-full overflow-hidden gap-0 p-2"}>
                <DialogHeader className={"flex flex-row items-center py-2"}>
                    <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"widget"} className={"size-10 text-2xl"}>
                                {emoji?.length > 0 ? emoji : <File size={24}/>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className={"p-0 z-[60]"} onWheel={(e) => e.stopPropagation()}>
                            <EmojiPicker
                                emojisPerRow={6}
                                emojiSize={40}
                                onEmojiSelect={(emoji) => handleEmojiSelect(emoji)}
                                className={"border-0 h-full"}
                            >
                                <EmojiPicker.Header className={"shadow-md dark:shadow-xl pb-1"}>
                                    <EmojiPicker.Input placeholder="Search emoji" hideIcon className={"px-1 bg-secondary border border-main/40"}/>
                                    <Button
                                        variant={"widget"}
                                        className={"h-7 hover:bg-error/10 hover:text-error"}
                                        onClick={handleRemoveEmoji}
                                    >
                                        Remove
                                    </Button>
                                </EmojiPicker.Header>
                                <EmojiPicker.Group>
                                    <ScrollArea className={"h-80"} thumbClassname={"bg-white/10"}>
                                        <EmojiPicker.List containerHeight={12976}/>
                                    </ScrollArea>
                                </EmojiPicker.Group>

                            </EmojiPicker>
                        </PopoverContent>
                    </Popover>
                    <Input
                        placeholder={"New note"}
                        value={title ?? ""}
                        onChange={(e) => {
                            setTitle(e.target.value)
                            setSaved(false)
                        }}
                        autoFocus={title.length === 0}
                        onBlur={handleTitleBlur}
                        className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0 !text-2xl text-primary font-medium p-2"}
                    />
                    <VisuallyHidden>
                        <DialogTitle/>
                    </VisuallyHidden>
                    <DialogClose iconSize={24} className={"absolute top-4 right-4 p-1 rounded-md hover:bg-white/5"}/>
                </DialogHeader>
                <EditorRoot>
                    <div className={"rounded-md h-[72vh]"}>
                        <EditorContent
                            autofocus={title.length !== 0 && "end"}
                            extensions={extensions}
                            initialContent={note.content ?? {}}
                            immediatelyRender={false}
                            onBlur={(params) => handleSave(params.editor)}
                            onUpdate={(params) => handleSave(params.editor)}
                            className="p-2 rounded-md h-full w-full bg-primary"
                            editorProps={{
                                handleDOMEvents: {
                                    keydown: (_view, event) => handleCommandNavigation(event)
                                },
                                attributes: {class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",},
                            }}
                        >
                            <EditorCommand
                                className={cn(
                                    "z-[60] w-72 rounded-md border border-main/60 bg-primary transition-all",
                                    "shadow-[10px_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)]")}
                            >
                                <EditorCommandEmpty className="flex items-center justify-center px-2 text-tertiary">
                                    No results
                                </EditorCommandEmpty>
                                <ScrollArea className="h-80">
                                    <EditorCommandList className={"p-2 pr-4"}>
                                        {suggestionItems.map((item) => (
                                            <EditorCommandItem
                                                value={item.title}
                                                onCommand={(val) => item.command?.(val)}
                                                className="group cursor-pointer flex w-full items-center gap-2 rounded-md py-1 px-2 text-left text-sm hover:bg-tertiary aria-selected:bg-tertiary"
                                                key={item.title}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-main/40 bg-primary group-hover:text-brand group-aria-selected:text-brand">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-primary">{item.title}</p>
                                                    <p className="text-xs text-secondary">{item.description}</p>
                                                </div>
                                            </EditorCommandItem>
                                        ))}
                                    </EditorCommandList>
                                </ScrollArea>
                            </EditorCommand>
                            <EditorBubble
                                tippyOptions={{placement: "top"}}
                                className='flex overflow-hidden rounded-md border border-main bg-primary shadow-lg'
                            >
                                <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                                <TextButtons />
                            </EditorBubble>
                        </EditorContent>
                    </div>
                </EditorRoot>
            </DialogContent>
        </Dialog>
    )
}

export const editorWidgetDefinition = defineWidget({
    name: "Editor",
    component: EditorWidget,
    description: "A simple text editor widget",
    image: "/github_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    },
    defaultConfig: {
        notes: [],
    },
})