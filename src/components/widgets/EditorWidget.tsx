"use client"

import type React from "react"
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
import {Spinner} from "@/components/ui/Spinner"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../ui/Dialog"
import {Widget} from "@/database"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {Input} from "@/components/ui/Input"

type Note = {
    id: string
    title: string
    content: string
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

    const [openNoteId, setOpenNoteId] = useState<string | null>(null)
    const [notes, setNotes] = useState<Note[]>(widget.config?.notes ?? [{
        id: "1",
        title: "Welcome to the Editor",
        content: "This is a"
    }])

    const handleSave = async (id: string, json: JSONContent) => {
        await refreshWidget({
            ...widget,
            config: {
                ...widget.config,
                notes: {
                    ...widget.config.notes,
                    [id]: json
                }
            }
        })
    }

    return (
        <WidgetTemplate id={id} name={"editor"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Notes"}/>
            <WidgetContent scroll>
                {notes.map((note: Note) => (
                    <NoteDialog
                        key={note.id}
                        open={openNoteId === note.id}
                        onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                        note={note}
                        widget={widget}
                        onSave={(json) => handleSave(note.id, json)}
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
    onSave: (json: JSONContent) => void
}

const NoteDialog: React.FC<NoteDialogProps> = ({open, onOpenChange, note, widget, onSave}) => {
    const [openNode, setOpenNode] = useState(false)
    const [saved, setSaved] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

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
    };

    const handleSave = async (editor: EditorInstance) => {
        setIsSaving(true)

        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))

        setSaved(true)
        onSave(json)
        setIsSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <div className={"w-full h-12 rounded-md hover:bg-primary"}>
                    {note.title || "New Note"}
                </div>
            </DialogTrigger>
            <DialogContent className={"md:min-w-[400px] h-full max-h-[80vh] w-full overflow-hidden gap-0 p-2"}>
                <DialogHeader>
                    <Input
                        placeholder={"New note"}
                        value={note.title ?? ""}
                        className={"shadow-none dark:shadow-none bg-0 border-0 focus:border-0 focus:bg-0 focus:outline-0 text-xl text-primary font-medium px-0"}
                    />
                    <VisuallyHidden>
                        <DialogTitle/>
                    </VisuallyHidden>
                </DialogHeader>
                <EditorRoot>
                    <div className={"rounded-md h-[72vh]"}>
                        <EditorContent
                            extensions={extensions}
                            initialContent={widget?.config?.content}
                            immediatelyRender={false}
                            onBlur={(params) => handleSave(params.editor)}
                            onUpdate={() => setSaved(false)}
                            className="p-2 rounded-md h-full w-full bg-secondary"
                            editorProps={{
                                handleDOMEvents: {
                                    keydown: (_view, event) => handleCommandNavigation(event)
                                },
                                attributes: {class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",},
                            }}
                        >
                            <EditorCommand className="z-50 w-72 rounded-md border border-main/60 bg-primary shadow-md transition-all">
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