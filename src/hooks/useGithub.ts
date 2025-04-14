import { fetchOpenIssuesAndPullsFromAllRepos } from "@/actions/github"
import { useIntegrationStore } from "@/store/integrationStore"
import {useCallback, useEffect, useState} from "react"

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useGithub = () => {
    const { githubIntegration } = useIntegrationStore()

    const [issues, setIssues] = useState<any[]>([])
    const [pullRequests, setPullRequests] = useState<any[]>([])
    const [lastFetched, setLastFetched] = useState<number | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const shouldRefetchData = (lastFetched: number | null): boolean => {
        if (!lastFetched) return true
        return Date.now() - lastFetched > CACHE_DURATION
    }

    const fetchData = useCallback((force = false) => {
        if (!githubIntegration?.accessToken) return
        if (!force && !shouldRefetchData(lastFetched)) return
        setLoading(true)

        fetchOpenIssuesAndPullsFromAllRepos(githubIntegration.accessToken)
            .then((fetch) => {
                if (!fetch) {
                    setLoading(false)
                    return
                }

                const seenIssueIds = new Set<number>()
                const seenPrIds = new Set<number>()

                const uniqueIssues = fetch.allIssues.filter((item: any) => {
                    if (seenIssueIds.has(item.id)) return false
                    seenIssueIds.add(item.id)
                    return true
                })

                const uniquePullRequests = fetch.allPullRequests.filter((item: any) => {
                    if (seenPrIds.has(item.id)) return false
                    seenPrIds.add(item.id)
                    return true
                })

                setIssues(uniqueIssues)
                setPullRequests(uniquePullRequests)
                setLastFetched(Date.now())
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [githubIntegration?.accessToken, lastFetched])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const allLabels = Array.from(new Set(issues
        .flatMap((issue) => issue.labels || [])
        .filter((label, index, self) => index === self.findIndex((l: any) => l.name === label.name))))

    const filteredIssues = issues.filter((issue) => {
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

    const filteredPRs = pullRequests.filter((pr: any) =>
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.repository_url
            .split('/')
            .pop()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
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