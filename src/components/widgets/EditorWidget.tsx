"use client"

import { Button } from "@/components/ui/Button"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetEmpty } from "@/components/widgets/base/WidgetEmpty"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import { Import, Plus } from "lucide-react"
import { JSONContent } from "novel"
import React, { Suspense, useCallback, useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover"
import { NotionPage, useNotion } from "@/hooks/useNotion"
import { ScrollArea } from "../ui/ScrollArea"
import { Skeleton } from "../ui/Skeleton"
import { cn } from "@/lib/utils"

const LazyNoteDialog = React.lazy(() => import("../../components/dialogs/NoteDialog").then(mod => ({ default: mod.NoteDialog })))

export type Note = {
    id: string
    title: string
    content: JSONContent
    emoji: string
    lastUpdated: Date
    notionSync?: {
        pageId: string
        title: string
        syncedAt: Date
    } | null
}

type PageNode = NotionPage & { children: PageNode[] }

export interface EditorConfig {
    notes: Note[]
}

const EditorWidget: React.FC<WidgetProps<EditorConfig>> = ({config, updateConfig}) => {
    const {isConnected, isLoadingPages, isLoadingPageContent, pages, fetchPageContent} = useNotion()

    const isLoadingNotionData = isLoadingPages || isLoadingPageContent

    const [openNoteId, setOpenNoteId] = useState<string | null>(null)
    const [notionPopoverOpen, setNotionPopoverOpen] = useState(false)

    const addTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new note",
        anchor: "tc"
    })

    const importTooltip = useTooltip<HTMLButtonElement>({
        message: "Import from Notion",
        anchor: "tc"
    })

    const createNewNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: "",
            content: {} as JSONContent,
            emoji: "",
            lastUpdated: new Date(),
            notionSync: null
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

    const handleNotionImport = useCallback(async (pageId: string) => {
        setNotionPopoverOpen(false)

        const pageContent = await fetchPageContent(pageId)
        if (!pageContent) return

        const newNote: Note = {
            id: crypto.randomUUID(),
            title: pageContent.title ?? "",
            content: pageContent.content,
            emoji: "",
            notionSync: {
                pageId: pageContent.id,
                title: pageContent.title,
                syncedAt: new Date(),
            },
            lastUpdated: new Date(),
        }

        await updateConfig({notes: [...config.notes, newNote]})
        setOpenNoteId(newNote.id)
    }, [fetchPageContent])

    const buildPageTree = useCallback((notionPages: NotionPage[]): PageNode[] => {
        const nodeMap = new Map<string, PageNode>()
        notionPages.map((page) => nodeMap.set(page.id, {...page, children: []}))

        const roots: PageNode[] = []

        notionPages.map((page) => {
            const node = nodeMap.get(page.id)!
            if (page.parentId && nodeMap.has(page.parentId)) nodeMap.get(page.parentId)!.children.push(node)
            else roots.push(node)
        })

        return roots
    }, [])

    const pageTree = useMemo(() => buildPageTree(pages), [buildPageTree, pages])

    const renderPageButtons = useCallback((nodes: PageNode[], depth = 1): React.ReactNode => (
        nodes.map((node) => (
            <React.Fragment key={node.id}>
                <Button
                    variant={"ghost"}
                    className={cn("justify-start h-6 px-2 text-sm shadow-none dark:shadow-none font-normal text-primary", depth > 1 && "text-secondary")}
                    style={{ paddingLeft: depth * 16 }}
                    onClick={() => void handleNotionImport(node.id)}
                >
                    {node.title}
                </Button>
                {node.children.length > 0 && renderPageButtons(node.children, depth + 1)}
            </React.Fragment>
        ))
    ), [handleNotionImport])

    return (
        <>
            <WidgetHeader title={"Notes"}>
                <Popover open={notionPopoverOpen} onOpenChange={setNotionPopoverOpen}>
                    <PopoverTrigger asChild disabled={!isConnected}>
                        <Button
                            variant={"widget"}
                            className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                            {...importTooltip}
                        >
                            <Import size={16} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align={"start"} className={"h-full w-40 max-w-60 overflow-hidden p-2"}>
                        <ScrollArea className={"h-60"}>
                            <p className="text-xs text-tertiary mb-2">Pages</p>
                            {isLoadingNotionData ? (
                                <div className="flex flex-col gap-2">
                                    <Skeleton className={"h-6 w-full"} />
                                    <Skeleton className={"h-6 w-full"} />
                                    <Skeleton className={"h-6 w-full"} />
                                    <Skeleton className={"h-6 w-full"} />
                                    <Skeleton className={"h-6 w-full"} />
                                    <Skeleton className={"h-6 w-full"} />
                                </div>
                            ) : pages.length === 0 ? (
                                <p className="text-xs text-secondary p-2">No pages found.</p>
                            ) : (
                                <div className={"flex flex-col gap-1"}>
                                    {renderPageButtons(pageTree)}
                                </div>
                            )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
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
                            <Suspense fallback={null} key={note.id}>
                                <LazyNoteDialog
                                    note={note}
                                    open={openNoteId === note.id}
                                    onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                                    onSave={(note) => handleSave(config.notes.map((n) => n.id === note.id ? note : n))}
                                    onDelete={(id) => handleDelete(id)}
                                />
                            </Suspense>
                        ))}
                    </div>
                </WidgetContent>
            )}
        </>
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
