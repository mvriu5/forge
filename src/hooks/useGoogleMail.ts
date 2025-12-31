"use client"

import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useSession } from "@/hooks/data/useSession"
import { authClient } from "@/lib/auth-client"
import { queryOptions } from "@/lib/queryOptions"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

export const useGoogleMail = (pageSize = 50) => {
    const { userId } = useSession()
    const { integrations, refetchIntegrations } = useIntegrations(userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])
    const queryClient = useQueryClient()

    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [filterLoading, setFilterLoading] = useState<boolean>(false)

    const previousUserId = useRef<string | undefined>(undefined)
    const isRefreshingToken = useRef(false)
    const hasSeenInitialSelection = useRef(false)

    useEffect(() => {
        if (!userId) {
            previousUserId.current = undefined
            isRefreshingToken.current = false
            setAccessToken(null)
            return
        }

        const userChanged = previousUserId.current !== userId
        previousUserId.current = userId
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
                    await authClient.refreshToken({ providerId: "google", userId })
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
    }, [googleIntegration, refetchIntegrations, userId])

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
            const res = await fetchMessageListPage(accessToken, labelQuery, pageParam as string, Math.max(50, pageSize))
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
    }, [messagesQuery.hasNextPage, messagesQuery.fetchNextPage, messagesQuery.isFetchingNextPage])

    const refresh = useCallback(async () => {
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

    const getSnippet = useCallback((messageId: string) => messages.find((m) => m.id === messageId)?.snippet ?? null, [messages])

    return {
        labels: labels ?? [],
        messages,
        isLoading: (labelsLoading || messagesQuery.isLoading) && messages.length === 0,
        isFetchingMore: messagesQuery.isFetchingNextPage,
        isError: labelsError || messagesQuery.isError,
        isReady: messagesQuery.isFetched && labelsFetched,
        refetch: refresh,
        googleIntegration,
        selectedLabels,
        setSelectedLabels,
        filterLoading,
        hasMore: Boolean(messagesQuery.hasNextPage),
        loadMore,
        getSnippet,
    }
}
