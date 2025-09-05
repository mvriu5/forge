"use client"

import {useIntegrationStore} from "@/store/integrationStore"
import {useQuery} from "@tanstack/react-query"
import {fetchLinearIssues, LinearIssue} from "@/actions/linear"
import {useState} from "react"

const useLinear = () => {
    const { linearIntegration } = useIntegrationStore()
    const [sortBy, setSortBy] = useState<"priority" | "created">("priority")

    const {data, isLoading, isFetching, isError, refetch} = useQuery<LinearIssue[]>({
        queryKey: ["linearIssues", linearIntegration?.accessToken],
        queryFn: async () => await fetchLinearIssues(linearIntegration?.accessToken!),
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
        linearIntegration,
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
