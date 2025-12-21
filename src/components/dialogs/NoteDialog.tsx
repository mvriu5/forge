"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { useSession } from "@/hooks/data/useSession"
import { useSettings } from "@/hooks/data/useSettings"
import { defaultExtensions } from "@/lib/extensions"
import { cn, formatDate, getUpdateTimeLabel } from "@/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { File, Trash } from "lucide-react"
import {
    EditorBubble,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    EditorInstance,
    EditorRoot,
    handleCommandNavigation
} from "novel"
import { useCallback, useEffect, useRef, useState } from "react"
import AutoJoiner from "tiptap-extension-auto-joiner"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import { Button } from "../ui/Button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/Dialog"
import { EmojiPicker } from "../ui/EmojiPicker"
import { Input } from "../ui/Input"
import { ScrollArea } from "../ui/ScrollArea"
import { Skeleton } from "../ui/Skeleton"
import { NodeSelector } from "../widgets/components/NodeSelector"
import { slashCommand, suggestionItems } from "../widgets/components/SlashCommand"
import { TextButtons } from "../widgets/components/TextButtons"
import { Note } from "../widgets/EditorWidget"


interface NoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    note: Note
    onSave: (note: Note) => void
    onDelete: (id: string) => void
    isPending: boolean
}

function NoteDialog({open, onOpenChange, note, onSave, onDelete, isPending}: NoteDialogProps) {
    const {userId} = useSession()
    const {settings} = useSettings(userId)

    const [title, setTitle] = useState(note.title)
    const [emoji, setEmoji] = useState(note.emoji)
    const [openNode, setOpenNode] = useState(false)
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

    const titleSaveTimeout = useRef<NodeJS.Timeout | null>(null)
    const contentSaveTimeout = useRef<NodeJS.Timeout | null>(null)

    const saveNote = useCallback((updates: Partial<Note>) => {
        onSave({
            ...note,
            ...updates,
            lastUpdated: updates.lastUpdated ?? new Date()
        })
    }, [note, onSave])

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
            saveNote({title})
            titleSaveTimeout.current = null
        }, 500)

        return () => {
            if (titleSaveTimeout.current) {
                clearTimeout(titleSaveTimeout.current)
                titleSaveTimeout.current = null
            }
        }
    }, [title, note.title, saveNote])

    const handleTitleBlur = useCallback(() => {
        if (titleSaveTimeout.current) {
            clearTimeout(titleSaveTimeout.current)
            titleSaveTimeout.current = null
        }
        if (title !== note.title) {
            onSave({id: note.id, title, content: note.content as any, emoji, lastUpdated: new Date()})
        }
    }, [title, note.title, saveNote])

    const handleEmojiSelect = useCallback((emoji: string) => {
        setEmoji(emoji)
        saveNote({emoji})
        setEmojiPickerOpen(false)
    }, [saveNote])

    const handleRemoveEmoji = useCallback(() => {
        setEmoji("")
        saveNote({emoji: ""})
        setEmojiPickerOpen(false)
    }, [saveNote])

    const persistContent = useCallback(async (editor: EditorInstance) => {
        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))
        saveNote({content: json, title, emoji})
    }, [highlightCodeblocks, saveNote, title, emoji])

    const handleSave = useCallback((editor: EditorInstance) => {
        if (contentSaveTimeout.current) {
            clearTimeout(contentSaveTimeout.current)
        }

        contentSaveTimeout.current = setTimeout(() => {
            void persistContent(editor)
            contentSaveTimeout.current = null
        }, 300)
    }, [persistContent])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogTrigger asChild>
                <div className={"group w-full p-1 flex items-center justify-between cursor-pointer text-primary rounded-md hover:bg-secondary"}>
                    <div className="flex items-center gap-2">
                        <div className={"text-2xl p-1 ml-1 rounded-md bg-black/5 dark:bg-white/5 text-primary flex items-center justify-center"}>
                            {emoji?.length > 0 ? emoji : <div className={"size-8 flex items-center justify-center"}><File size={24}/></div>}
                        </div>
                        <div className={"flex flex-col"}>
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
            <DialogContent className={"md:min-w-200 max-w-[90vw] h-[80vh] max-h-[80vh] w-full overflow-hidden gap-0 p-2 flex flex-col"}>
                <DialogHeader className={"flex flex-row items-center gap-2"}>
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Skeleton className={"size-11 rounded-md"} />
                            <div className="flex flex-col gap-2">
                                <Skeleton className={"h-6 w-48"} />
                                <Skeleton className={"h-4 w-32"} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"widget"} className={"size-11 text-2xl border border-main/40"}>
                                        {emoji?.length > 0 ? emoji : <File size={24}/>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className={"p-0 z-60"} onWheel={(e) => e.stopPropagation()}>
                                    <EmojiPicker
                                        emojisPerRow={6}
                                        emojiSize={40}
                                        onEmojiSelect={(emoji) => handleEmojiSelect(emoji)}
                                        onRemove={handleRemoveEmoji}
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className={"flex flex-col items-start"}>
                                <Input
                                    placeholder={"New note"}
                                    value={title ?? ""}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus={title.length === 0}
                                    onBlur={handleTitleBlur}
                                    className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0 text-lg! text-primary font-medium p-0"}
                                />
                                <p className="text-tertiary/50 text-xs font-mono -mt-0.5">
                                    {formatDate(note.lastUpdated, settings?.config.hourFormat)}
                                </p>
                            </div>
                        </>
                    )}
                    <VisuallyHidden>
                        <DialogTitle/>
                    </VisuallyHidden>
                    <DialogClose iconSize={16} className={"absolute top-2 right-2 p-1 rounded-md hover:bg-white/5"}/>
                </DialogHeader>
                {isPending ? (
                    <div className="h-full flex flex-col justify-between rounded-md bg-primary/20">
                        <Skeleton className={"h-8 w-1/3 rounded-md mt-6"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-8 w-1/2 rounded-md mb-4"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md mb-4"} />
                        <Skeleton className={"h-8 w-2/3 rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-full rounded-md"} />
                        <Skeleton className={"h-6 w-1/2 rounded-md"} />
                    </div>
                ) : (
                    <EditorRoot>
                        <div className={"rounded-md h-full"}>
                            <ScrollArea className="h-[72vh]">
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
                                        attributes: { class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-full cursor-text" },
                                    }}
                                >
                                    <EditorCommand
                                        className={cn(
                                            "z-60 w-72 rounded-md border border-main/60 bg-primary transition-all",
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
                                        tippyOptions={{ placement: "top" }}
                                        className='flex overflow-hidden rounded-md border border-main bg-primary shadow-lg'
                                    >
                                        <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                                        <TextButtons />
                                    </EditorBubble>
                                </EditorContent>
                            </ScrollArea>
                        </div>
                    </EditorRoot>
                )}
            </DialogContent>
        </Dialog>
    )
}

export { NoteDialog }
