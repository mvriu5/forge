"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { useSession } from "@/hooks/data/useSession"
import { useSettings } from "@/hooks/data/useSettings"
import { formatDate, getUpdateTimeLabel } from "@/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { Editor as TipTapEditor } from "@tiptap/core"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { File, Trash } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../ui/Button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/Dialog"
import { EmojiPicker } from "../ui/EmojiPicker"
import { Input } from "../ui/Input"
import { ScrollArea } from "../ui/ScrollArea"
import { Skeleton } from "../ui/Skeleton"
import { Note } from "../widgets/EditorWidget"
import { TextButtons } from "../widgets/components/TextButtons"
import SlashSuggestion, { filterCommandItems } from "@/lib/extensions"

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
            if (titleSaveTimeout.current) {
                clearTimeout(titleSaveTimeout.current)
                titleSaveTimeout.current = null
            }
        }
    }, [])

    const extensions = [
        StarterKit.configure({
            bulletList: { HTMLAttributes: { class: "list-disc list-outside leading-3 -mt-2" } },
            orderedList: { HTMLAttributes: { class: "list-decimal list-outside leading-3 -mt-2" } },
            listItem: { HTMLAttributes: { class: "leading-normal -mb-2" } },
        }),
        Placeholder.configure({ placeholder: "Write something..." }),
        Link.configure({ HTMLAttributes: { class: "text-info/60 underline underline-offset-[3px] hover:text-info transition-colors cursor-pointer" } }),
        TaskList.configure({ HTMLAttributes: { class: "not-prose pl-2" } }),
        TaskItem.configure({ HTMLAttributes: { class: "flex items-start my-4" }, nested: true }),
        HorizontalRule.configure({ HTMLAttributes: { class: "mt-4 mb-6 border-t border-main/60" } }),
    ]

    const highlightCodeblocks = useCallback((content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html")
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            if (typeof (window as any).hljs?.highlightElement === "function") {
                // @ts-ignore
                (window as any).hljs.highlightElement(el)
            }
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
    }, [title, note.title, note.id, onSave, emoji])

    const handleEmojiSelect = useCallback((emojiStr: string) => {
        setEmoji(emojiStr)
        saveNote({emoji: emojiStr})
        setEmojiPickerOpen(false)
    }, [saveNote])

    const handleRemoveEmoji = useCallback(() => {
        setEmoji("")
        saveNote({emoji: ""})
        setEmojiPickerOpen(false)
    }, [saveNote])

    const editor = useEditor({
        extensions: [...extensions,
            SlashSuggestion.configure({
              suggestion: {
                items: ({ query }: { query: string }) => filterCommandItems(query),
              },
            })
        ],
        content: note.content ?? "",
        editorProps: {
            attributes: { class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-full cursor-text p-2" }
        },
        onUpdate: ({ editor }) => {
            handleSave(editor)
        },
        onBlur: ({ editor }) => {
            handleSave(editor)
        }
    })

    const persistContent = useCallback(async (editorInstance: TipTapEditor) => {
        const json = editorInstance.getJSON()
        const html = highlightCodeblocks(editorInstance.getHTML())
        try {
            window.localStorage.setItem("html-content", html)
        } catch {
            // ignore localStorage errors
        }
        saveNote({content: json, title, emoji})
    }, [highlightCodeblocks, saveNote, title, emoji])

    const handleSave = useCallback((editorInstance: TipTapEditor | null) => {
        if (!editorInstance) return

        if (contentSaveTimeout.current) {
            clearTimeout(contentSaveTimeout.current)
        }

        contentSaveTimeout.current = setTimeout(() => {
            void persistContent(editorInstance)
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
                    <div className={"rounded-md h-full"}>
                        <ScrollArea className="h-[72vh]">
                            <div className="p-2 rounded-md max-h-full min-h-full w-full bg-primary">
                                {editor ? (
                                    <>
                                        <EditorContent editor={editor} />
                                        <BubbleMenu editor={editor} tippyOptions={{ placement: "top" }}>
                                            <TextButtons editor={editor} />
                                        </BubbleMenu>
                                    </>
                                ) : null}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export { NoteDialog }
