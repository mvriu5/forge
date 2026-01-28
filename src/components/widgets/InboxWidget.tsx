"use client"

import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useNotifications } from "@/hooks/data/useNotifications"
import { useSettings } from "@/hooks/data/useSettings"
import { authClient } from "@/lib/auth-client"
import { WidgetProps } from "@/lib/definitions"
import { queryOptions } from "@/lib/queryOptions"
import { defineWidget } from "@/lib/widget"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { Filter, RefreshCw } from "lucide-react"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../ui/Button"
import { DropdownMenu, MenuItem } from "../ui/Dropdown"
import { Skeleton } from "../ui/Skeleton"
import { Spinner } from "../ui/Spinner"
import { useTooltip } from "../ui/TooltipProvider"
import { WidgetContent } from "./base/WidgetContent"
import { WidgetEmpty } from "./base/WidgetEmpty"
import { WidgetHeader } from "./base/WidgetHeader"

const GMAIL_LABELS_QUERY_KEY = (accessToken: string | null) => ["gmailLabels", accessToken] as const
const GMAIL_MESSAGES_QUERY_KEY = (accessToken: string | null, selectedLabels: string[]) => ["gmailMessages", accessToken, selectedLabels] as const

export interface GmailLabel {
    id: string
    name: string
    messageListVisibility?: string
    labelListVisibility?: string
    type?: string
    color?: {
        backgroundColor: string
        foregroundColor: string
    }
}

interface GmailListResponse {
    messages?: { id: string; threadId?: string }[]
    nextPageToken?: string
    resultSizeEstimate?: number
}

export interface GmailMessage {
    id: string
    threadId?: string
    labelIds?: string[]
    snippet?: string
    internalDate?: string
    payload?: any
    payloadHeaders?: { name: string; value: string }[]
    raw?: string
}

interface GmailMessagesPage {
    messages: GmailMessage[]
    nextPageToken?: string
}

export function getHeaderValue(message: GmailMessage | null, name: string): string | null {
    if (!message?.payload?.headers) return null
    const header = (message.payload.headers as { name: string; value: string }[]).find((h) => h.name?.toLowerCase() === name.toLowerCase())
    return header?.value ?? null
}

async function fetchGmailLabels(accessToken: string | null): Promise<GmailLabel[]> {
    if (!accessToken) return []

    const res = await fetch("https://www.googleapis.com/gmail/v1/users/me/labels", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) throw new Error("Failed to fetch Gmail labels")

    const data = await res.json()
    return (data.labels ?? []) as GmailLabel[]
}

async function fetchMessageListPage(accessToken: string, labelQuery?: string | null, pageToken?: string, pageSize = 10): Promise<GmailListResponse> {
    const params = new URLSearchParams({ maxResults: String(Math.min(pageSize, 500)) })
    if (labelQuery) params.set("q", labelQuery)
    if (pageToken) params.set("pageToken", pageToken)

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) return {}

    return res.json()
}

async function fetchMessageDetails(accessToken: string, messageId: string): Promise<GmailMessage | null> {
    const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) return null
    return res.json()
}

async function fetchWithConcurrency<T, R>(items: T[], worker: (item: T) => Promise<R>, concurrency = 8): Promise<(R | null)[]> {
    if (!items.length) return []
    const results: (R | null)[] = new Array(items.length).fill(null)
    let index = 0

    async function runner() {
        while (true) {
            const i = index++
            if (i >= items.length) return
            try {
                results[i] = await worker(items[i])
            } catch {
                results[i] = null
            }
        }
    }

    const workers = new Array(Math.min(concurrency, items.length)).fill(0).map(() => runner())
    await Promise.all(workers)
    return results
}

function formatLabelQuery(labelName: string): string {
    const safeLabel = labelName.replace(/"/g, '\\"')
    if (safeLabel.match(/\s/)) return `label:"${safeLabel}"`
    return `label:${safeLabel}`
}

const LazyInboxDialog = React.lazy(() => import("../../components/dialogs/InboxDialog").then(mod => ({ default: mod.InboxDialog })))

const InboxWidget: React.FC<WidgetProps> = ({ widget }) => {
    const { settings } = useSettings(widget.userId)
    const { sendMailNotification } = useNotifications(widget.userId)

    const { integrations, refetchIntegrations } = useIntegrations(widget.userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])
    const queryClient = useQueryClient()

    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [filterLoading, setFilterLoading] = useState<boolean>(false)

    const previousUserId = useRef<string | undefined>(undefined)
    const isRefreshingToken = useRef(false)
    const hasSeenInitialSelection = useRef(false)

    useEffect(() => {
        if (!widget.userId) {
            previousUserId.current = undefined
            isRefreshingToken.current = false
            setAccessToken(null)
            return
        }

        const userChanged = previousUserId.current !== widget.userId
        previousUserId.current = widget.userId
        if (userChanged) isRefreshingToken.current = false

        if (!googleIntegration) {
            setAccessToken(null)
            return
        }

        const tokenExpired = googleIntegration.accessTokenExpiration
            ? new Date(googleIntegration.accessTokenExpiration).getTime() <= new Date().getTime()
            : false
        const missingToken = !googleIntegration.accessToken
        const shouldRefreshToken = tokenExpired || missingToken || userChanged

        if (shouldRefreshToken && !isRefreshingToken.current) {
            isRefreshingToken.current = true
            const refreshAccessToken = async () => {
                try {
                    await authClient.refreshToken({ providerId: "google", userId: widget.userId })
                    await refetchIntegrations()
                } catch {
                    setAccessToken(googleIntegration.accessToken ?? null)
                } finally {
                    isRefreshingToken.current = false
                }
            }

            void refreshAccessToken()
            return
        }

        setAccessToken(googleIntegration.accessToken)
    }, [googleIntegration, refetchIntegrations, widget.userId])

    const { data: labels, isLoading: labelsLoading, isError: labelsError, isFetched: labelsFetched } = useQuery<GmailLabel[], Error>(queryOptions({
        queryKey: GMAIL_LABELS_QUERY_KEY(accessToken),
        queryFn: () => fetchGmailLabels(accessToken),
        enabled: Boolean(accessToken)
    }))

    useEffect(() => {
        if (labels?.length && selectedLabels.length === 0) {
            const inboxLabel = labels.find((l) => l.id === "INBOX")
            if (inboxLabel) {
                setSelectedLabels([inboxLabel.id])
                return
            }
            const inboxByName = labels.find((l) => l.name?.toLowerCase().includes("inbox"))
            if (inboxByName) {
                setSelectedLabels([inboxByName.id])
                return
            }
            setSelectedLabels([labels[0].id])
        }
    }, [labels, selectedLabels])

    const labelQuery = useMemo(() => {
        if (!labels || selectedLabels.length === 0) return null
        const labelNames = labels
            .filter((label) => selectedLabels.includes(label.id))
            .map((label) => label.name ?? label.id)
            .filter(Boolean)
        if (labelNames.length === 0) return null
        return labelNames.map((labelName) => formatLabelQuery(labelName)).join(" OR ")
    }, [labels, selectedLabels])

    const messagesQuery = useInfiniteQuery<GmailMessagesPage, Error>({
        queryKey: GMAIL_MESSAGES_QUERY_KEY(accessToken, selectedLabels),
        enabled: Boolean(accessToken && labelQuery),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 3,
        initialPageParam: undefined,
        queryFn: async ({ pageParam }) => {
            if (!accessToken || !labelQuery) return { messages: [] }
            const res = await fetchMessageListPage(accessToken, labelQuery, pageParam as string, 50)
            const ids = (res.messages ?? []).map((m) => m.id).filter(Boolean)
            const details = await fetchWithConcurrency(ids, (id) => fetchMessageDetails(accessToken, id), 8)
            const parsed = details.filter(Boolean) as GmailMessage[]
            return { messages: parsed, nextPageToken: res.nextPageToken }
        },
        getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined
    })

    const messages = useMemo(() => {
        const allMessages = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? []
        return [...allMessages].sort((a, b) => Number(b.internalDate ?? 0) - Number(a.internalDate ?? 0))
    }, [messagesQuery.data])

    const loadMore = useCallback(async () => {
        if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) return
        await messagesQuery.fetchNextPage()
    }, [messagesQuery])

    const refetch = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: GMAIL_MESSAGES_QUERY_KEY(accessToken, selectedLabels) })
        await messagesQuery.refetch()
    }, [accessToken, messagesQuery, queryClient, selectedLabels])

    useEffect(() => {
        if (hasSeenInitialSelection.current) setFilterLoading(true)
        else hasSeenInitialSelection.current = true
    }, [selectedLabels])

    useEffect(() => {
        if (!labelsLoading && !messagesQuery.isFetching && filterLoading) setFilterLoading(false)
    }, [labelsLoading, messagesQuery.isFetching, filterLoading])

    const isLoading = (labelsLoading || messagesQuery.isLoading) && messages.length === 0
    const isFetchingMore = messagesQuery.isFetchingNextPage
    const isError = labelsError || messagesQuery.isError
    const isReady = messagesQuery.isFetched && labelsFetched
    const hasMore = Boolean(messagesQuery.hasNextPage)

    const [openMailId, setOpenMailId] = useState<string | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const latestSeenIdRef = useRef<string | null>(null)
    const hasInitializedRef = useRef(false)
    const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const transformedLabels = useMemo(() => (labels ?? []).map((label) => {
        let name = (label.name ?? "").toString()

        if (name.startsWith("CATEGORY_")) name = name.slice("CATEGORY_".length)
        name = name.replace(/_/g, " ").toLowerCase().trim()

        const displayName = name.charAt(0).toUpperCase() + name.slice(1)

        return { ...label, displayName }
    }), [labels])

    const dropdownFilterItems: MenuItem[] = transformedLabels
        .filter((label): label is typeof label & { name: string } => !!label.name)
        .map((label) => ({
            type: "checkbox",
            key: label.id,
            label: label.displayName,
            checked: selectedLabels.includes(label.id),
            onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label.id) ? prev.filter((id) => id !== label.id) : [...prev, label.id]))
        }))

    useEffect(() => {
        if (!settings?.config.mailReminder) return
        if (!messages || messages.length === 0) return

        const newest = messages[0]

        if (!hasInitializedRef.current) {
            latestSeenIdRef.current = newest.id
            hasInitializedRef.current = true
            return
        }

        if (latestSeenIdRef.current !== newest.id) {
            latestSeenIdRef.current = newest.id

            void sendMailNotification?.({
                type: "reminder",
                id: newest.id,
                message: getHeaderValue(newest, "Subject") ?? "(No subject)",
                snippet: newest.snippet ?? "",
                key: `mail-${newest.id}`
            })
        }
    }, [messages, settings?.config.mailReminder, sendMailNotification])

    useEffect(() => {
        if (!loadMoreTriggerRef.current) return
        const el = loadMoreTriggerRef.current
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && hasMore && !isFetchingMore) {
                    void loadMore()
                }
            })
        }, { root: null, rootMargin: "200px", threshold: 0.1 })

        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, loadMore])

    const hasNoMails = useMemo(() => {
        return isReady && Array.isArray(messages) && messages.length === 0 && !isLoading
    }, [messages, isLoading, isReady])

    return (
        <>
            <WidgetHeader title={"Inbox"}>
                <DropdownMenu
                    asChild
                    items={dropdownFilterItems}
                    align={"end"}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                >
                    <Button
                        data-state={dropdownOpen ? "open" : "closed"}
                        variant={"widget"}
                        className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                        disabled={labels?.length === 0 || isLoading || isFetchingMore || isRefreshing || filterLoading}
                        {...filterTooltip}
                    >
                        <Filter size={16} />
                    </Button>
                </DropdownMenu>
                <Button
                    variant={"widget"}
                    onClick={() => {
                        void (async () => {
                            setIsRefreshing(true)
                            await refetch()
                            setIsRefreshing(false)
                        })()
                    }}
                    data-loading={(isLoading || isFetchingMore || isRefreshing || filterLoading) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {!isReady ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                    </div>
                ) : hasNoMails ? (
                    <WidgetEmpty message={"No upcoming meetings"} />
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {messages.map((m, index) => (
                            <Suspense fallback={<Skeleton className={"h-17 w-full px-2"} />} key={`email-${index}-${m.id}`}>
                                <LazyInboxDialog
                                    message={m}
                                    labels={labels?.filter((l) => m.labelIds?.includes(l.id))}
                                    open={openMailId === m.id}
                                    onOpenChange={(isOpen) => setOpenMailId(isOpen ? m.id : null)}
                                />
                            </Suspense>
                        ))}

                        <div className="flex flex-col items-center mt-2">
                            {hasMore ? (
                                <Button
                                    variant={"widget"}
                                    onClick={() => void loadMore()}
                                    disabled={isFetchingMore}
                                >
                                    {isFetchingMore && <Spinner />}
                                    {isFetchingMore ? "Loading" : "Load more"}
                                </Button>
                            ) : (
                                <div className="text-sm">No more messages</div>
                            )}
                        </div>
                        <div ref={loadMoreTriggerRef} />
                    </div>
                )}
            </WidgetContent>
        </>
    )
}

export const inboxWidgetDefinition = defineWidget({
    name: "Inbox",
    integration: "google",
    component: InboxWidget,
    description: "See your received google mails.",
    image: "/inbox_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    }
})
