import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useQuery} from "@tanstack/react-query"

const JIRA_QUERY_KEY = (accessToken: string | null) => ["jiraBoards", accessToken] as const

// --- API Types (minimal) ---

type JiraBoardFromApi = {
    id: number
    name: string
    type: string
    location?: {
        projectKey?: string
        projectName?: string
    }
}

type JiraBoardConfigFromApi = {
    columnConfig: {
        columns: {
            name: string
            statuses: { id: string; name: string }[]
        }[]
    }
    location?: {
        projectKey?: string
        projectName?: string
    }
}

type JiraIssueFromApi = {
    id: string
    key: string
    fields: {
        summary: string
        status: {
            id: string
            name: string
        }
        assignee?: {
            accountId: string
            displayName: string
        } | null
    }
}

type JiraMyself = {
    accountId: string
    displayName: string
}

// --- Domain Types für dein UI ---

export type JiraColumn = {
    name: string
    statusIds: string[]
}

export type JiraIssue = JiraIssueFromApi

export type JiraBoard = {
    id: number
    name: string
    type: string
    projectKey?: string
    projectName?: string
    columns: JiraColumn[]
    issues: JiraIssue[]
}

// --- 1) Jira-BaseUrl aus Access Token holen ---

async function getBaseUrlFromAccessToken(accessToken: string): Promise<string> {
    const res = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch accessible resources: ${res.status} ${res.statusText}`)
    }

    const data: any[] = await res.json()

    const jiraResource = data.find((r) =>
        (r.scopes || []).some((s: string) => s.startsWith("read:jira")),
    )

    if (!jiraResource) {
        throw new Error("No Jira resource found for this access token")
    }

    return jiraResource.url.replace(/\/+$/, "") // z.B. "https://dein-team.atlassian.net"
}

// --- 2) Generic Agile Pagination ---

async function fetchAgilePaginated<T>(
    baseUrl: string,
    accessToken: string,
    pathWithQuery: string,
): Promise<T[]> {
    const items: T[] = []
    let startAt = 0
    const maxResults = 50

    while (true) {
        const url = `${baseUrl}${pathWithQuery}${
            pathWithQuery.includes("?") ? "&" : "?"
        }startAt=${startAt}&maxResults=${maxResults}`

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        })

        if (!res.ok) {
            throw new Error(`Jira request failed: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        const pageValues: T[] = data.values ?? []
        items.push(...pageValues)

        if (data.isLast || pageValues.length === 0) break
        startAt += maxResults
    }

    return items
}

// --- 3) Helpers: myself, boards, config, issues ---

async function getMyself(baseUrl: string, accessToken: string): Promise<JiraMyself> {
    const res = await fetch(`${baseUrl}/rest/api/3/myself`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch Jira user: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

async function getAllKanbanBoards(
    baseUrl: string,
    accessToken: string,
): Promise<JiraBoardFromApi[]> {
    return fetchAgilePaginated<JiraBoardFromApi>(
        baseUrl,
        accessToken,
        "/rest/agile/1.0/board?type=kanban",
    )
}

async function getBoardConfig(
    baseUrl: string,
    accessToken: string,
    boardId: number,
): Promise<JiraBoardConfigFromApi> {
    const res = await fetch(`${baseUrl}/rest/agile/1.0/board/${boardId}/configuration`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch board config ${boardId}: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

async function getBoardIssues(
    baseUrl: string,
    accessToken: string,
    boardId: number,
): Promise<JiraIssueFromApi[]> {
    const path = `/rest/agile/1.0/board/${boardId}/issue?fields=summary,status,assignee`
    return fetchAgilePaginated<JiraIssueFromApi>(baseUrl, accessToken, path)
}

// --- 4) Kombi: Boards + Columns + Issues (nur deine) ---

async function getBoardsWithColumnsAndIssues(
    accessToken: string,
    filterToMyIssues = true,
): Promise<JiraBoard[]> {
    const baseUrl = await getBaseUrlFromAccessToken(accessToken)
    const sanitizedBaseUrl = baseUrl.replace(/\/+$/, "")

    const [boards, myself] = await Promise.all([
        getAllKanbanBoards(sanitizedBaseUrl, accessToken),
        getMyself(sanitizedBaseUrl, accessToken),
    ])

    const accountId = myself.accountId

    return Promise.all(
        boards.map(async (board) => {
            const [config, issues] = await Promise.all([
                getBoardConfig(sanitizedBaseUrl, accessToken, board.id),
                getBoardIssues(sanitizedBaseUrl, accessToken, board.id),
            ])

            const columns: JiraColumn[] = config.columnConfig.columns.map((col) => ({
                name: col.name,
                statusIds: col.statuses.map((s) => s.id),
            }))

            const filteredIssues = filterToMyIssues
                ? issues.filter((issue) => issue.fields.assignee?.accountId === accountId)
                : issues

            return {
                id: board.id,
                name: board.name,
                type: board.type,
                projectKey: config.location?.projectKey ?? board.location?.projectKey,
                projectName: config.location?.projectName ?? board.location?.projectName,
                columns,
                issues: filteredIssues,
            }
        }),
    )
}

export const useJira = () => {
    const {userId} = useSession()
    const {integrations} = useIntegrations(userId)
    const atlassianIntegration = getIntegrationByProvider(integrations, "atlassian")
    const accessToken = atlassianIntegration?.accessToken ?? null

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: JIRA_QUERY_KEY(accessToken),
        queryFn: () => getBoardsWithColumnsAndIssues(accessToken!, true),
        enabled: Boolean(accessToken),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })

    return {
        boards: data ?? [],
        isLoading,
        isFetching,
        isError,
        refetch,
    }
}
