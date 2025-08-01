"use client"

import React, {useEffect} from "react"
import {useState} from "react"
import {
    EditorRoot,
    EditorContent,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandList,
    EditorCommandItem, handleCommandNavigation,
    EditorBubble,
    EditorInstance, JSONContent
} from "novel"
import {defaultExtensions} from "@/lib/extensions"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {slashCommand, suggestionItems} from "@/components/widgets/components/SlashCommand"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {NodeSelector } from "./components/NodeSelector"
import {TextButtons} from "@/components/widgets/components/TextButtons"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import AutoJoiner from "tiptap-extension-auto-joiner"
import {useWidgetStore} from "@/store/widgetStore"
import { useDashboardStore } from "@/store/dashboardStore"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../ui/Dialog"
import {Widget} from "@/database"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {Input} from "@/components/ui/Input"
import {Plus, Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {tooltip} from "@/components/ui/TooltipProvider"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"

type Note = {
    id: string
    title: string
    content: JSONContent
    lastUpdated: Date
}

const EditorWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        return (
            <WidgetTemplate id={id} name={"editor"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <div className={"rounded-md h-full w-full border border-main/40 bg-secondary"}/>
            </WidgetTemplate>
        )
    }

    const {getWidget, refreshWidget} = useWidgetStore()
    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "editor")
    if (!widget) return

    const addTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new note",
        anchor: "tc"
    })

    const [openNoteId, setOpenNoteId] = useState<string | null>(null)
    const [notes, setNotes] = useState<Note[]>(() => {
        const cfg: Note[] = widget.config?.notes
        if (!cfg) return []
        return Object.entries(cfg).map(([id, { title, content, lastUpdated }]) => ({
            id,
            title,
            content,
            lastUpdated: new Date(lastUpdated)
        }))
    })

    useEffect(() => {
        const cfg = widget.config?.notes as Note[]
        if (!cfg) return
        setNotes(
            Object.entries(cfg).map(([id, { title, content, lastUpdated }]) => ({
                id,
                title,
                content,
                lastUpdated: new Date(lastUpdated)
            }))
        )
    }, [widget.config?.notes])


    const createNewNote = () => {
        const newNote: Note = {
            id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: "New Note",
            content: {} as JSONContent,
            lastUpdated: new Date()
        }
        setNotes([...notes, newNote])
        setOpenNoteId(newNote.id)
    }

    const handleSave = async (id: string, data: { title: string, content: JSONContent, lastUpdated: Date }) => {
        const existingNotes = widget.config?.notes ?? {}

        await refreshWidget({
            ...widget,
            config: {
                ...widget.config,
                notes: {
                    ...existingNotes,
                    [id]: data,
                }
            }
        })

        setNotes((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, title: data.title, content: data.content, lastUpdated: data.lastUpdated } : n
            )
        )
    }

    const handleDelete = (id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id))
        const updatedNotes = { ...widget.config?.notes }
        delete updatedNotes[id]

        refreshWidget({
            ...widget,
            config: {
                ...widget.config,
                notes: updatedNotes
            }
        })
    }

    return (
        <WidgetTemplate id={id} name={"editor"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
            {notes.length === 0 && <WidgetEmpty message={"No notes available. Create a new note to get started."}/>}
            <WidgetContent scroll>
                {notes.map((note: Note) => (
                    <NoteDialog
                        key={note.id}
                        open={openNoteId === note.id}
                        onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                        note={note}
                        widget={widget}
                        onSave={(id, data) => handleSave(id, data)}
                        onDelete={(id) => handleDelete(id)}
                    />
                ))}
            </WidgetContent>
        </WidgetTemplate>
    )
}

interface NoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    note: Note
    widget: Widget
    onSave: (id: string, data: { title: string; content: JSONContent, lastUpdated: Date }) => void
    onDelete: (id: string) => void
}

const NoteDialog: React.FC<NoteDialogProps> = ({open, onOpenChange, note, widget, onSave, onDelete}) => {
    const [title, setTitle] = useState(note.title)
    const [openNode, setOpenNode] = useState(false)
    const [saved, setSaved] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setTitle(note.title)
    }, [note.title])

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
        const doc = new DOMParser().parseFromString(content, "text/html");
        // biome-ignore lint/complexity/noForEach: <explanation>
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        });
        return new XMLSerializer().serializeToString(doc);
    }

    const getUpdateLabel = () => {
        const now = new Date()
        const diffSec = (now.getTime() - note.lastUpdated.getTime()) / 1000

        if (diffSec < 120) {
            return 'Updated now'
        }

        const minutes = Math.floor(diffSec / 60)
        if (diffSec < 60 * 60) {
            return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`
        }

        const hours = Math.floor(diffSec / 3600)
        if (diffSec < 60 * 60 * 24) {
            return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`
        }

        const days = Math.floor(diffSec / (3600 * 24))
        if (diffSec < 3600 * 24 * 7) {
            return `Updated ${days} day${days !== 1 ? 's' : ''} ago`
        }

        const weeks = Math.floor(diffSec / (3600 * 24 * 7))
        if (diffSec < 3600 * 24 * 30) {
            return `Updated ${weeks} week${weeks !== 1 ? 's' : ''} ago`
        }

        const months = Math.floor(diffSec / (3600 * 24 * 30))
        if (diffSec < 3600 * 24 * 30 * 12) {
            return `Updated ${months} month${months !== 1 ? 's' : ''} ago`
        }

        return 'Updated last year'
    }

    const handleTitleBlur = () => {
        if (title !== note.title) {
            onSave(note.id, { title, content: note.content as any, lastUpdated: new Date() })
            setSaved(true)
        }
    }

    const handleSave = async (editor: EditorInstance) => {
        setIsSaving(true)

        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))

        onSave(note.id, { title, content: json, lastUpdated: new Date() })
        setSaved(true)
        setIsSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <div className={"group w-full p-1 flex items-center justify-between text-primary rounded-md hover:bg-primary"}>
                    <div className={"flex flex-col gap-1"}>
                        {note.title ?? "New Note"}
                        <p className={"text-tertiary font-mono text-sm"}>
                            {getUpdateLabel()}
                        </p>
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
                <DialogHeader className={"py-2"}>
                    <Input
                        placeholder={"New note"}
                        value={title ?? ""}
                        onChange={(e) => {
                            setTitle(e.target.value)
                            setSaved(false)
                        }}
                        autoFocus={false}
                        onBlur={handleTitleBlur}
                        className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0 !text-2xl text-primary font-medium p-2"}
                    />
                    <VisuallyHidden>
                        <DialogTitle/>
                    </VisuallyHidden>
                </DialogHeader>
                <EditorRoot>
                    <div className={"rounded-md h-[72vh]"}>
                        <EditorContent
                            autofocus={"end"}
                            extensions={extensions}
                            initialContent={widget?.config?.notes?.[note.id]?.content ?? {}}
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
                            <EditorCommand className="z-[60] w-72 rounded-md border border-main/60 bg-primary shadow-[10px_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)] transition-all">
                                <EditorCommandEmpty className="flex items-center justify-center px-2 text-tertiary">
                                    No results
                                </EditorCommandEmpty>
                                <ScrollArea className="h-80">
                                    <EditorCommandList className={"p-2 pr-4"}>
                                        {suggestionItems.map((item) => (
                                            <EditorCommandItem
                                                value={item.title}
                                                onCommand={(val) => item.command?.(val)}
                                                className="group cursor-pointer flex w-full items-center gap-2 rounded-md py-1 px-2 text-left text-sm hover:bg-secondary aria-selected:bg-secondary"
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
                                className='flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-main bg-primary shadow-lg'
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

export { EditorWidget }