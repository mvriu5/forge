"use client"

import {useQuery} from "@tanstack/react-query"
import {useMemo, useState} from "react"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {LinearClient} from "@linear/sdk"

const LINEAR_QUERY_KEY = (accessToken: string | null) => ["linearIssues", accessToken] as const

type SortOption = "priority" | "created"

export type LinearIssue = {
    id: string
    title: string
    description?: string
    stateName: string | undefined
    labels: Array<{name: string; color?: string}>
    priority: number
    priorityName: string
    url: string
    project: string | undefined
    team: string | undefined
    createdAt: string
    updatedAt: string
}

async function fetchLinearIssues(accessToken: string): Promise<LinearIssue[]> {
    const client = new LinearClient({accessToken})
    const user = await client.viewer
    const issues = await user.assignedIssues()

    return await Promise.all(
        issues.nodes.map(async (issue) => {
            const [stateObj, projectObj, teamObj, labelsConn] = await Promise.all([
                issue.state,
                issue.project,
                issue.team,
                issue.labels(),
            ])

            const labels = labelsConn?.nodes.map(label => ({
                name: label.name,
                color: label.color,
            })) ?? []

            return {
                id: issue.id,
                title: issue.title,
                description: issue.description ?? undefined,
                stateName: stateObj?.name,
                labels,
                priority: issue.priority,
                priorityName: issue.priorityLabel,
                url: issue.url,
                project: projectObj?.name,
                team: teamObj?.name,
                createdAt: issue.createdAt.toString(),
                updatedAt: issue.updatedAt.toString(),
            }
        }),
    )
}

const useLinear = () => {
    const {userId} = useSession()
    const {integrations} = useIntegrations(userId)
    const linearIntegration = useMemo(() => getIntegrationByProvider(integrations, "linear"), [integrations])

    const [sortBy, setSortBy] = useState<SortOption>("priority")

    const {data, isLoading, isFetching, isError, refetch} = useQuery<LinearIssue[]>({
        queryKey: LINEAR_QUERY_KEY(linearIntegration?.accessToken ?? null),
        queryFn: () => fetchLinearIssues(linearIntegration?.accessToken!),
        enabled: Boolean(linearIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        select: (issues) => {
            const sorted = [...issues];
            switch (sortBy) {
                case "priority":
                    return sorted.sort((a, b) => (a.priority ?? Number.POSITIVE_INFINITY) - (b.priority ?? Number.POSITIVE_INFINITY));
                case "created":
                    return sorted.sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                default: return issues
            }
        }
    })


    return {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
        sortBy,
        setSortBy,
    }
}

export { useLinear, type SortOption }
