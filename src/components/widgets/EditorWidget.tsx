"use client"

import { Button } from "@/components/ui/Button"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetEmpty } from "@/components/widgets/base/WidgetEmpty"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { authClient } from "@/lib/auth-client"
import { WidgetProps } from "@/lib/definitions"
import { blocksToJSONContent } from "@/lib/notion"
import { queryOptions } from "@/lib/queryOptions"
import { cn } from "@/lib/utils"
import { defineWidget } from "@/lib/widget"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Import, Plus } from "lucide-react"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Notion } from "../svg/Icons"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover"
import { ScrollArea } from "../ui/ScrollArea"
import { Skeleton } from "../ui/Skeleton"
import { toast } from "../ui/Toast"

export interface NotionPage {
    id: string
    title: string
    isChild: boolean
    parentId: string | null
}

export interface NotionPageContent {
    id: string
    title: string
    content: any
}

interface NotionPagesResponse {
    pages?: NotionPage[]
}

interface NotionPageResponse {
    id: string
    title: string
    blocks?: unknown[]
}

const NOTION_PAGES_QUERY_KEY = (userId: string | undefined) => ["notionPages", userId] as const

async function fetchPages(userId: string | null): Promise<NotionPage[]> {
    if (!userId) return []

    const response = await fetch(`/api/notion/pages?userId=${userId}`)

    if (!response.ok) throw new Error("Failed to load Notion pages")

    const data: NotionPagesResponse = await response.json()
    return data.pages ?? []
}

async function fetchPageContent(userId: string | null, pageId: string): Promise<NotionPageContent | null> {
    if (!userId) return null

    const response = await fetch(`/api/notion/pages/${pageId}?userId=${userId}`)

    if (!response.ok) throw new Error("Unable to load the Notion page")

    const data: NotionPageResponse = await response.json()

    return {
        id: data.id,
        title: data.title,
        content: blocksToJSONContent(data.blocks ?? [])
    }
}

const LazyNoteDialog = React.lazy(() => import("../../components/dialogs/NoteDialog").then(mod => ({ default: mod.NoteDialog })))

export type Note = {
    id: string
    title: string
    content: any
    emoji: string
    lastUpdated: Date | string
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

const EditorWidget: React.FC<WidgetProps<EditorConfig>> = ({ widget, config, updateConfig }) => {
    const { integrations, refetchIntegrations, handleIntegrate } = useIntegrations(widget.userId)
    const notionIntegration = useMemo(() => getIntegrationByProvider(integrations, "notion"), [integrations])
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const isRefreshingToken = useRef(false)

    useEffect(() => {
        if (!widget.userId) {
            setAccessToken(null)
            return
        }

        if (!notionIntegration) {
            setAccessToken(null)
            return
        }

        const expired = notionIntegration.accessTokenExpiration
            ? new Date(notionIntegration.accessTokenExpiration).getTime() <= Date.now()
            : false
        const missing = !notionIntegration.accessToken
        const shouldRefresh = expired || missing

        if (shouldRefresh && !isRefreshingToken.current) {
            isRefreshingToken.current = true
            const refresh = async () => {
                try {
                    await authClient.refreshToken({ providerId: "notion", userId: widget.userId })
                    await refetchIntegrations()
                } catch {
                    toast.error("Unable to refresh Notion access. Try reconnecting.")
                } finally {
                    isRefreshingToken.current = false
                }
            }
            void refresh()
            return
        }

        setAccessToken(notionIntegration.accessToken ?? null)
    }, [notionIntegration, refetchIntegrations, widget.userId])

    const hasAccess = Boolean(accessToken)

    const { data: pagesData, isLoading: isLoadingPages, isFetching: isFetchingPages, refetch: refetchPages } = useQuery<NotionPage[], Error>(queryOptions({
        queryKey: NOTION_PAGES_QUERY_KEY(widget.userId),
        queryFn: () => fetchPages(widget.userId ?? null),
        enabled: Boolean(widget.userId && hasAccess),
    }))
    const pages = pagesData ?? []

    const fetchPageContentMutation = useMutation({
        mutationFn: (pageId: string) => fetchPageContent(widget.userId ?? null, pageId),
        onError: () => {
            toast.error("Unable to load the Notion page")
        }
    })

    const isConnected = Boolean(accessToken)
    const isLoadingPageContent = fetchPageContentMutation.isPending
    const fetchPageContentFn = fetchPageContentMutation.mutateAsync

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

    const getNoteTime = useCallback((note: Note) => {
        const time = note.lastUpdated instanceof Date
            ? note.lastUpdated.getTime()
            : new Date(note.lastUpdated).getTime()
        return Number.isFinite(time) ? time : 0
    }, [])

    const sortedNotes = useMemo(() => (
        [...config.notes].sort((a, b) => getNoteTime(b) - getNoteTime(a))
    ), [config.notes, getNoteTime])

    const createNewNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: "",
            content: {} as any,
            emoji: "",
            lastUpdated: new Date(),
            notionSync: null
        }
        await updateConfig({ notes: [...config.notes, newNote] })
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

        const pendingNoteId = crypto.randomUUID()
        const pendingNote: Note = {
            id: pendingNoteId,
            title: "",
            content: {} as any,
            emoji: "",
            lastUpdated: new Date(),
            notionSync: null
        }

        const notesWithPending = [...config.notes, pendingNote]
        await updateConfig({ notes: notesWithPending })
        setOpenNoteId(pendingNoteId)

        const pageContent = await fetchPageContentFn(pageId)
        if (!pageContent) {
            await updateConfig({ notes: config.notes })
            setOpenNoteId(null)
            toast.error("Failed to load Notion page.")
            return
        }

        const updatedNotes = notesWithPending.map((note) =>
            note.id === pendingNoteId ? {
                ...note,
                title: pageContent.title ?? "",
                content: pageContent.content,
                lastUpdated: new Date(),
                notionSync: {
                    pageId: pageContent.id,
                    title: pageContent.title,
                    syncedAt: new Date(),
                }
            } : note
        )

        await updateConfig({ notes: updatedNotes })
        setOpenNoteId(pendingNoteId)
    }, [fetchPageContentFn, updateConfig, config.notes])

    const buildPageTree = useCallback((notionPages: NotionPage[]): PageNode[] => {
        const nodeMap = new Map<string, PageNode>()
        notionPages.forEach((page) => nodeMap.set(page.id, { ...page, children: [] }))

        const roots: PageNode[] = []

        notionPages.forEach((page) => {
            const node = nodeMap.get(page.id)!
            if (page.parentId && nodeMap.has(page.parentId)) {
                nodeMap.get(page.parentId)!.children.push(node)
            } else {
                roots.push(node)
            }
        })

        return roots
    }, [])

    const pageTree = useMemo(() => buildPageTree(pages), [buildPageTree, pages])

    const renderPageButtons = useCallback((nodes: PageNode[], depth = 1): React.ReactNode => (nodes.map((node) => (
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
                    <PopoverTrigger asChild>
                        <Button
                            variant={"widget"}
                            className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                            {...importTooltip}
                        >
                            <Import size={16} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align={"start"} className={"h-full min-w-40 w-full max-w-60 overflow-hidden p-2"}>
                        {!isConnected ? (
                            <Button
                                className="gap-2 border-0 shadow-none dark:shadow-none px-2 rounded-sm"
                                onClick={() => void handleIntegrate("notion")}
                            >
                                <Notion className="size-4 fill-secondary" />
                                Connect Notion
                            </Button>
                        ) : (
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
                        )}
                    </PopoverContent>
                </Popover>
                <Button
                    variant={"widget"}
                    className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                    onClick={createNewNote}
                    {...addTooltip}
                >
                    <Plus size={16} />
                </Button>
            </WidgetHeader>
            {sortedNotes.length === 0 ? (
                <WidgetEmpty message={"No notes yet."} />
            ) : (
                <WidgetContent scroll>
                    <div className={"flex flex-col gap-2"}>
                        {sortedNotes.map((note: Note) => (
                            <Suspense fallback={null} key={note.id}>
                                <LazyNoteDialog
                                    note={note}
                                    open={openNoteId === note.id}
                                    onOpenChange={(isOpen) => setOpenNoteId(isOpen ? note.id : null)}
                                    onSave={(note) => handleSave(config.notes.map((n) => n.id === note.id ? note : n))}
                                    onDelete={(id) => handleDelete(id)}
                                    isPending={isLoadingPageContent}
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
    image: "/editor_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    },
    defaultConfig: {
        notes: [],
    },
})
