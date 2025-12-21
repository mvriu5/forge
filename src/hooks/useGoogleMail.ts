import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "@/hooks/data/useSession"
import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { authClient } from "@/lib/auth-client"
import posthog from "posthog-js"

const GMAIL_LABELS_QUERY_KEY = (accessToken: string | null) => ["googleGmailLabels", accessToken] as const

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

/**
 * Fetch available labels for the signed-in Gmail account.
 */
async function fetchGmailLabels(accessToken: string | null): Promise<GmailLabel[]> {
    if (!accessToken) return []

    const res = await fetch("https://www.googleapis.com/gmail/v1/users/me/labels", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) throw new Error("Failed to fetch Gmail labels")

    const data = await res.json()
    return (data.labels ?? []) as GmailLabel[]
}

/**
 * Fetch a single page of message ids for a label.
 * Returns the raw API response (which may contain nextPageToken).
 */
async function fetchMessageListPage(accessToken: string, labelId: string, pageToken?: string, pageSize = 10): Promise<GmailListResponse> {
    const params = new URLSearchParams({ maxResults: String(Math.min(pageSize, 500)) })
    if (labelId) params.set("labelIds", labelId)
    if (pageToken) params.set("pageToken", pageToken)

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) {
        // return empty shape so caller can mark label as exhausted or handle it
        return {}
    }
    return res.json()
}

/**
 * Fetch full message details for a single message id.
 */
async function fetchMessageDetails(accessToken: string, messageId: string): Promise<GmailMessage | null> {
    const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) return null
    return res.json()
}

/**
 * Helper: run worker over items with bounded concurrency.
 * Returns an array of results in the same order as `items`. Errors are returned as null entries.
 */
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

/**
 * Hook: useGoogleMail
 * - Uses the existing Google integration from `useIntegrations`.
 * - Loads labels via react-query.
 * - Implements on-scroll pagination for messages: `loadMore()` will fetch more message ids and then fetch details.
 *
 * API:
 * const { labels, messages, isLoading, isFetchingMore, hasMore, loadMore, refetch, selectedLabels, setSelectedLabels } = useGoogleMail(pageSize?)
 */
export const useGoogleMail = (pageSize = 50) => {
    const { userId } = useSession()
    const { integrations, refetchIntegrations } = useIntegrations(userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [filterLoading, setFilterLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const previousUserId = useRef<string | undefined>(undefined)
    const isRefreshingToken = useRef(false)
    const hasSeenInitialSelection = useRef(false)

    // Manage token refresh & access token state (mirrors useGoogleCalendar approach)
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

    // Labels via react-query (cached, refetchable)
    const { data: labels, isLoading: labelsLoading, isFetching: labelsFetching, isError: labelsError } = useQuery<GmailLabel[], Error>({
        queryKey: GMAIL_LABELS_QUERY_KEY(accessToken),
        queryFn: () => fetchGmailLabels(accessToken),
        enabled: Boolean(accessToken),
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount) => failureCount < 3,
    })

    // initialize selectedLabels to INBOX only (fallback to inbox-like or first label)
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
            // fallback to first label id
            setSelectedLabels([labels[0].id])
        }
    }, [labels, selectedLabels])

    // --- On-scroll pagination implementation ---

    // Stored messages (details)
    const [messages, setMessages] = useState<GmailMessage[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // Internal queue and pagination state:
    // - `messageIdQueue` holds ids that are ready to be fetched for details.
    // - `fetchedIds` prevents duplicate detail fetches.
    // - `labelNextPage` holds nextPageToken for each label (null = exhausted).
    // - `labelIndexPointer` rotates through labels to fetch pages round-robin.
    const messageIdQueue = useRef<string[]>([])
    const fetchedIds = useRef<Set<string>>(new Set())
    const labelNextPage = useRef<Record<string, string | null>>({})
    const labelIndexPointer = useRef(0)

    // Reset pagination when token or label selection changes
    useEffect(() => {
        messageIdQueue.current = []
        fetchedIds.current = new Set()
        labelNextPage.current = {}
        labelIndexPointer.current = 0
        setMessages([])
        setHasMore(true)
    }, [accessToken, selectedLabels.join(",")])

    /**
     * Ensure the messageIdQueue has at least `count` ids (or exhausts available ids).
     * This fetches pages of ids per selected label in a round-robin manner.
     */
    const ensureQueueHas = useCallback(async (count: number) => {
        if (!accessToken || !labels) return

        const labelIds = labels.filter((l) => selectedLabels.includes(l.id)).map((l) => l.id)
        if (!labelIds.length) {
            setHasMore(false)
            return
        }

        while (messageIdQueue.current.length < count) {
            let attempts = 0
            let fetchedAny = false

            while (attempts < labelIds.length) {
                const idx = labelIndexPointer.current % labelIds.length
                const labelId = labelIds[idx]
                labelIndexPointer.current = (labelIndexPointer.current + 1) % labelIds.length
                attempts++

                const nextToken = labelNextPage.current[labelId] // undefined = not fetched yet, null = exhausted
                if (nextToken === null) continue // exhausted

                try {
                    const res = await fetchMessageListPage(accessToken, labelId, nextToken ?? undefined, Math.max(50, pageSize))
                    const ids = (res.messages ?? []).map((m) => m.id).filter(Boolean)
                    for (const id of ids) {
                        if (!fetchedIds.current.has(id) && !messageIdQueue.current.includes(id)) messageIdQueue.current.push(id)
                    }

                    // nextPageToken undefined => exhausted => mark null so we don't hit it again
                    labelNextPage.current[labelId] = res.nextPageToken ?? null
                    fetchedAny = true

                    if (messageIdQueue.current.length >= count) break
                } catch (err) {
                    // Log to telemetry and mark label exhausted to avoid tight loops on error
                    posthog.captureException(err, { hook: "useGoogleMail.ensureQueueHas", userId })
                    labelNextPage.current[labelId] = null
                }
            }

            if (!fetchedAny) {
                // No new ids could be fetched -> exhausted
                setHasMore(false)
                break
            }
        }
    }, [accessToken, labels, pageSize, selectedLabels, userId])

    /**
     * Public: loadMore
     * - Ensures `requested` message ids are available in the queue then fetches details for them.
     * - Appends resulting message details to `messages` state.
     */
    const loadMore = useCallback(async (requested = pageSize) => {
        if (!accessToken || !labels) return
        if (!hasMore && messageIdQueue.current.length === 0) return

        setIsLoadingMore(true)
        try {
            await ensureQueueHas(requested)

            const idsToFetch: string[] = []
            while (idsToFetch.length < requested && messageIdQueue.current.length > 0) {
                const id = messageIdQueue.current.shift()!
                if (!fetchedIds.current.has(id)) {
                    fetchedIds.current.add(id)
                    idsToFetch.push(id)
                }
            }

            if (!idsToFetch.length) {
                setIsLoadingMore(false)
                return
            }

            // Fetch message details with bounded concurrency to avoid hitting API rate limits.
            // Use `fetchWithConcurrency` (defaults to 8 concurrent requests).
            const details = await fetchWithConcurrency(idsToFetch, (id) => fetchMessageDetails(accessToken, id), 8)
            const parsed = details.filter(Boolean) as GmailMessage[]

            // Append and keep messages sorted by internalDate desc
            setMessages((prev) => {
                const merged = [...prev, ...parsed]
                merged.sort((a, b) => Number(b.internalDate ?? 0) - Number(a.internalDate ?? 0))
                return merged
            })

            // If no label has a next token and queue is empty -> exhausted
            const anyLabelHasNext = Object.values(labelNextPage.current).some((t) => t !== null && t !== undefined)
            if (!anyLabelHasNext && messageIdQueue.current.length === 0) setHasMore(false)
        } catch (err) {
            posthog.captureException(err, { hook: "useGoogleMail.loadMore", userId })
        } finally {
            setIsLoadingMore(false)
        }
    }, [accessToken, ensureQueueHas, labels, pageSize, hasMore, userId])

    /**
     * Refresh: reset internal state and load first page.
     */
    const refresh = useCallback(async () => {
        messageIdQueue.current = []
        fetchedIds.current = new Set()
        labelNextPage.current = {}
        labelIndexPointer.current = 0
        setMessages([])
        setHasMore(true)
        await loadMore(pageSize)
    }, [loadMore, pageSize])

    // Load initial page when ready
    useEffect(() => {
        if (accessToken && labels && selectedLabels.length) {
            void loadMore(pageSize)
        }
    }, [accessToken, labels, selectedLabels.join(",")])

    // keep UI filter loading state similar to calendar hook behavior
    useEffect(() => {
        if (hasSeenInitialSelection.current) setFilterLoading(true)
        else hasSeenInitialSelection.current = true
    }, [selectedLabels])

    useEffect(() => {
        if (!labelsLoading && !isLoadingMore && filterLoading) setFilterLoading(false)
    }, [labelsLoading, isLoadingMore, filterLoading])

    const getSnippet = useCallback((messageId: string) => messages.find((m) => m.id === messageId)?.snippet ?? null, [messages])

    // optional: manual invalidation for labels/messages
    const manualRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: GMAIL_LABELS_QUERY_KEY(accessToken) }),
        ])
        // reset and load again
        await refresh()
    }, [queryClient, accessToken, refresh])

    return {
        labels: labels ?? [],
        messages,
        isLoading: labelsLoading && messages.length === 0,
        isFetchingMore: isLoadingMore,
        isError: labelsError,
        refetch: manualRefresh,
        googleIntegration,
        selectedLabels,
        setSelectedLabels,
        filterLoading,
        hasMore,
        loadMore,
        getSnippet,
    }
}
