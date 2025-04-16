import {useIntegrationStore} from "@/store/integrationStore"
import {useMemo, useState} from "react"
import {useQuery} from "@tanstack/react-query"
import {fetchOpenIssuesAndPullsFromAllRepos} from "@/actions/github"

export const useGithub = () => {
    const { githubIntegration } = useIntegrationStore()
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: ["githubIssues", githubIntegration?.accessToken],
        queryFn: async () => await fetchOpenIssuesAndPullsFromAllRepos(githubIntegration?.accessToken!),
        enabled: Boolean(githubIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    const issues = data?.allIssues ?? []
    const pullRequests = data?.allPullRequests ?? []

    const allLabels = Array.from(new Set(issues
        .flatMap((issue: any) => issue.labels || [])
        .filter((label: { name: any }, index: any, self: any[]) => index === self.findIndex((l: any) => l.name === label.name))))

    const filteredIssues = useMemo(() => {
        return issues.filter((issue: any) => {
            const matchesSearch =
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.repository_url
                    .split('/')
                    .pop()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())

            const matchesLabels = selectedLabels.length === 0 || (issue.labels?.some((label: any) => selectedLabels.includes(label)))
            return matchesSearch && matchesLabels
        })
    }, [issues, searchQuery, selectedLabels])


    const filteredPRs = useMemo(() => {
        return pullRequests.filter((pr: any) =>
            pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pr.repository_url
                .split('/')
                .pop()
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
    }, [pullRequests, searchQuery])


    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedLabels,
        setSelectedLabels,
        allLabels,
        filteredIssues,
        filteredPRs,
        isLoading,
        isFetching,
        isError,
        refetch,
        githubIntegration
    }
}