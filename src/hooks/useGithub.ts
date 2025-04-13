import { fetchOpenIssuesAndPullsFromAllRepos } from "@/actions/github"
import {shouldRefetchData, useGithubStore } from "@/store/githubStore"
import { useIntegrationStore } from "@/store/integrationStore"
import {useCallback, useEffect, useState} from "react"

export const useGithub = () => {
    const { githubIntegration } = useIntegrationStore()
    const { data, loading, setLoading, setData } = useGithubStore()

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const fetchData = useCallback((force = false) => {
        setLoading(true)
        if (!githubIntegration?.accessToken) return
        if (!force && !shouldRefetchData(data.lastFetched)) return

        fetchOpenIssuesAndPullsFromAllRepos(githubIntegration.accessToken).then((data) => {
            if (!data) return

            const seenIssueIds = new Set<number>()
            const seenPrIds = new Set<number>()

            const fIssues = data.allIssues.filter(item => {
                if (seenIssueIds.has(item.id)) return false
                seenIssueIds.add(item.id)
                return true
            })

            const fPrs = data.allPullRequests.filter(item => {
                if (seenPrIds.has(item.id)) return false
                seenPrIds.add(item.id)
                return true
            })

            setData({ issues: fIssues, pullRequests: fPrs })
            setLoading(false)
        })
    }, [githubIntegration?.accessToken, data.lastFetched, setData, setLoading])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const allLabels = Array.from(new Set(data.issues
        .flatMap((issue) => issue.labels || [])
        .filter((label, index, self) =>
            index === self.findIndex((l) => l.name === label.name)
        )))

    const filteredIssues = data.issues.filter((issue) => {
        const matchesSearch =
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.repository_url.split('/').pop().toLowerCase().includes(searchQuery.toLowerCase())

        const matchesLabels =
            selectedLabels.length === 0 || (issue.labels?.some((label: any) => selectedLabels.includes(label)))

        return matchesSearch && matchesLabels
    })

    const filteredPRs = data.pullRequests.filter((pr: any) =>
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.repository_url.split('/').pop().toLowerCase().includes(searchQuery.toLowerCase())
    )

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
        fetchData,
        loading,
        githubIntegration,
    }
}