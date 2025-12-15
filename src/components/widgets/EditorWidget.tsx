"use client"

import React, {useCallback, useEffect, useRef, useState} from "react"
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
import {File, Plus, Trash, X} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {cn, getUpdateTimeLabel} from "@/lib/utils"
import {defineWidget, WidgetProps } from "@tryforgeio/sdk"
import {EmojiPicker} from "@/components/ui/EmojiPicker"

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

    const createNewNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: "",
            content: {} as JSONContent,
            emoji: "",
            lastUpdated: new Date()
        }
        await updateConfig({notes: [...config.notes, newNote]})
        setOpenNoteId(newNote.id)
    }, [setOpenNoteId, updateConfig, config.notes])

    const handleSave = useCallback(async (updatedNotes: Note[]) => {
        await updateConfig({ notes: updatedNotes })
    }, [updateConfig])


    const handleDelete = useCallback(async (idToDelete: string) => {
        const updatedNotes = config.notes.filter((n) => n.id !== idToDelete)
        await handleSave(updatedNotes)
    }, [config.notes, handleSave])

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
            {config.notes.length === 0 ? (
                <WidgetEmpty message={"No notes yet."}/>
            ) : (
                <WidgetContent scroll>
                    <div className={"flex flex-col gap-2"}>
                        {config.notes.map((note: Note) => (
                            <NoteDialog
                                key={note.id}
                                note={note}
                                open={openNoteId === note.id}
                                onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                                onSave={(note) => handleSave(config.notes.map((n) => n.id === note.id ? note : n))}
                                onDelete={(id) => handleDelete(id)}
                            />
                        ))}
                    </div>
                </WidgetContent>
            )}
        </>
    )
}

interface NoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    note: Note
    onSave: (note: Note) => void
    onDelete: (id: string) => void
}

const NoteDialog: React.FC<NoteDialogProps> = ({open, onOpenChange, note, onSave, onDelete}) => {
    const [title, setTitle] = useState(note.title)
    const [emoji, setEmoji] = useState(note.emoji)
    const [openNode, setOpenNode] = useState(false)
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [_, setSaved] = useState(true)
    const [__, setIsSaving] = useState(false)

    const titleSaveTimeout = useRef<NodeJS.Timeout | null>(null)
    const contentSaveTimeout = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setTitle(note.title)
        setEmoji(note.emoji)
    }, [note.title, note.emoji])

    useEffect(() => {
        return () => {
            if (contentSaveTimeout.current) {
                clearTimeout(contentSaveTimeout.current)
                contentSaveTimeout.current = null
            }
        }
    }, [])

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

    const highlightCodeblocks = useCallback((content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html")
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        })
        return new XMLSerializer().serializeToString(doc)
    }, [])

    useEffect(() => {
        if (title === note.title) return

        if (titleSaveTimeout.current) {
            clearTimeout(titleSaveTimeout.current)
        }

        titleSaveTimeout.current = setTimeout(() => {
            onSave({id: note.id, title, content: note.content as any, emoji, lastUpdated: new Date()})
            setSaved(true)
            titleSaveTimeout.current = null
        }, 500)

        return () => {
            if (titleSaveTimeout.current) {
                clearTimeout(titleSaveTimeout.current)
                titleSaveTimeout.current = null
            }
        }
    }, [title, note.title, note.id, note.content, emoji, onSave])

    const handleTitleBlur = useCallback(() => {
        if (titleSaveTimeout.current) {
            clearTimeout(titleSaveTimeout.current)
            titleSaveTimeout.current = null
        }
        if (title !== note.title) {
            onSave({id: note.id, title, content: note.content as any, emoji, lastUpdated: new Date()})
            setSaved(true)
        }
    }, [title, note.title, note.id, note.content, emoji, onSave])

    const handleEmojiSelect = useCallback((emoji: string) => {
        setEmoji(emoji)
        onSave({id: note.id, title, content: note.content as any, emoji, lastUpdated: new Date()})
        setSaved(true)
        setEmojiPickerOpen(false)
    }, [note.id, title, onSave])

    const handleRemoveEmoji = useCallback(() => {
        setEmoji("")
        onSave({id: note.id, title, content: note.content as any, emoji: "", lastUpdated: new Date()})
        setSaved(true)
        setEmojiPickerOpen(false)
    }, [note.id, title, onSave])

    const persistContent = useCallback(async (editor: EditorInstance) => {
        setIsSaving(true)

        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))

        onSave({id: note.id, title, content: json, emoji, lastUpdated: new Date()})
        setSaved(true)
        setIsSaving(false)
    }, [note.id, title, emoji, onSave])

    const handleSave = useCallback((editor: EditorInstance) => {
        if (contentSaveTimeout.current) {
            clearTimeout(contentSaveTimeout.current)
        }

        contentSaveTimeout.current = setTimeout(() => {
            void persistContent(editor)
            contentSaveTimeout.current = null
        }, 300)
    }, [])

    const flushSave = useCallback((editor: EditorInstance) => {
        if (contentSaveTimeout.current) {
            clearTimeout(contentSaveTimeout.current)
            contentSaveTimeout.current = null
        }

        void persistContent(editor)
    }, [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
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
            <DialogContent className={"md:min-w-[800px] h-[80vh] max-h-[80vh] w-full overflow-hidden gap-0 p-2 flex flex-col"}>
                <DialogHeader className={"flex flex-row items-center py-2"}>
                    <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"widget"} className={"size-8 text-2xl"}>
                                {emoji?.length > 0 ? emoji : <File size={16}/>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className={"p-0 z-[60]"} onWheel={(e) => e.stopPropagation()}>
                            <EmojiPicker
                                emojisPerRow={6}
                                emojiSize={40}
                                onEmojiSelect={(emoji) => handleEmojiSelect(emoji)}
                                onRemove={handleRemoveEmoji}
                            />
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
                        className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0 !text-lg text-primary font-medium p-2"}
                    />
                    <VisuallyHidden>
                        <DialogTitle/>
                    </VisuallyHidden>
                    <DialogClose iconSize={16} className={"absolute top-4 right-4 p-1 rounded-md hover:bg-white/5"}/>
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
                            className="p-2 rounded-md max-h-full min-h-full w-full bg-primary"
                            editorProps={{
                                handleDOMEvents: {
                                    keydown: (_view, event) => handleCommandNavigation(event)
                                },
                                attributes: {class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-full cursor-text"},
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