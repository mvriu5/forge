"use client"

import {toast} from "@/components/ui/Toast"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useSession} from "@/hooks/data/useSession"
import {authClient} from "@/lib/auth-client"
import {blocksToJSONContent, plainTextToJSONContent} from "@/lib/notion"
import { queryOptions } from "@/lib/queryOptions"
import {useMutation, useQuery} from "@tanstack/react-query"
import posthog from "posthog-js"
import {useEffect, useMemo, useRef, useState} from "react"

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

export const useNotion = () => {
    const {userId} = useSession()
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const notionIntegration = useMemo(() => getIntegrationByProvider(integrations, "notion"), [integrations])
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const isRefreshingToken = useRef(false)

    useEffect(() => {
        if (!userId) {
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
                    await authClient.refreshToken({providerId: "notion", userId})
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
    }, [notionIntegration, refetchIntegrations, userId])

    const hasAccess = Boolean(accessToken)

    const {data: pages, isLoading: isLoadingPages, isFetching: isFetchingPages, refetch: refetchPages} = useQuery<NotionPage[], Error>(queryOptions({
        queryKey: NOTION_PAGES_QUERY_KEY(userId),
        queryFn: () => fetchPages(userId ?? null),
        enabled: Boolean(userId && hasAccess),
    }))

    const fetchPageContentMutation = useMutation({
        mutationFn: (pageId: string) => fetchPageContent(userId ?? null, pageId),
        onError:  (error, pageId) => {
            toast.error("Unable to load the Notion page")
            posthog.captureException(error, { hook: "useNotion.fetchPageContentMutation", userId, pageId })
        }
    })

    return {
        isConnected: Boolean(accessToken),
        isRefreshing: isRefreshingToken.current,
        pages: pages ?? [],
        isLoadingPages: isLoadingPages || isFetchingPages,
        refetchPages,
        fetchPageContent: fetchPageContentMutation.mutateAsync,
        isLoadingPageContent: fetchPageContentMutation.isPending,
    }
}
