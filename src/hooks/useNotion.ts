"use client"

import {useMutation, useQuery} from "@tanstack/react-query"
import {useEffect, useMemo, useRef, useState} from "react"
import {JSONContent} from "novel"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {authClient} from "@/lib/auth-client"
import {toast} from "@/components/ui/Toast"
import {plainTextToJSONContent} from "@/lib/notion"

export type NotionPage = {
    id: string
    title: string
}

export type NotionPageContent = {
    id: string
    title: string
    content: JSONContent
}

const NOTION_PAGES_QUERY_KEY = (userId: string | undefined) => ["notionPages", userId] as const

async function fetchPages(userId: string | null): Promise<NotionPage[]> {
    if (!userId) return []

    const response = await fetch(`/api/notion/pages?userId=${userId}`)

    if (!response.ok) throw new Error("Failed to load Notion pages")

    const data = await response.json()
    return data.pages ?? []
}

async function fetchPageContent(userId: string | null, pageId: string): Promise<NotionPageContent | null> {
    if (!userId) return null

    const response = await fetch(`/api/notion/pages/${pageId}?userId=${userId}`)

    if (!response.ok) throw new Error("Unable to load the Notion page")

    const data = await response.json()

    return {
        id: data.id,
        title: data.title,
        content: plainTextToJSONContent(data.plainText ?? "")
    }
}

export const useNotion = () => {
    const {userId} = useSession()
    const {integrations, refetchIntegrations, handleIntegrate} = useIntegrations(userId)
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
                    await authClient.refreshToken({ providerId: "notion", userId })
                    await refetchIntegrations()
                } catch (error) {
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

    const {data: pages = [], isLoading: isLoadingPages, isFetching: isFetchingPages, refetch: refetchPages} = useQuery({
        queryKey: NOTION_PAGES_QUERY_KEY(userId),
        queryFn: () => fetchPages(userId ?? null),
        enabled: Boolean(userId && hasAccess),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })

    const fetchPageContentMutation = useMutation({
        mutationFn: (pageId: string) => fetchPageContent(userId ?? null, pageId),
        onError: () => toast.error("Unable to load the Notion page"),
    })


    return {
        isConnected: Boolean(accessToken),
        isRefreshing: isRefreshingToken.current,
        pages,
        isLoadingPages: isLoadingPages || isFetchingPages,
        refetchPages,
        fetchPageContent: fetchPageContentMutation.mutateAsync,
        isLoadingPageContent: fetchPageContentMutation.isPending,
    }
}
