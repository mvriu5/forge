import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useSession } from "@/hooks/data/useSession"
import { queryOptions } from "@/lib/queryOptions"
import { Octokit } from "@octokit/rest"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

const GITHUB_QUERY_KEY = (accessToken: string | null) => ["githubIssues", accessToken] as const

type UserRepositoryListResponse = Awaited<ReturnType<Octokit["repos"]["listForAuthenticatedUser"]>>
type UserRepository = UserRepositoryListResponse["data"][number]

type OrganizationRepositoryListResponse = Awaited<ReturnType<Octokit["repos"]["listForOrg"]>>
type OrganizationRepository = OrganizationRepositoryListResponse["data"][number]

type Repository = UserRepository | OrganizationRepository

type IssuesListResponse = Awaited<ReturnType<Octokit["issues"]["listForRepo"]>>
type Issue = IssuesListResponse["data"][number]

interface OpenItemsResponse {
    allIssues: Issue[]
    allPullRequests: Issue[]
}

interface Label {
    id?: number
    name?: string
    color?: string
}

async function fetchPaginated<T>(fetchFunction: (page: number) => Promise<{ data: T[] }>, perPage = 100): Promise<T[]> {
    const items: T[] = []
    let page = 1

    while (true) {
        const response = await fetchFunction(page)
        items.push(...response.data)
        if (response.data.length < perPage) break
        page += 1
    }

    return items
}

async function getAllRepositories(accessToken: string): Promise<{repos: Repository[], octokit: Octokit | null}> {
    const octokit = new Octokit({auth: accessToken})

    const [userRepos, orgsResponse] = await Promise.all([
        fetchPaginated(page => octokit.repos.listForAuthenticatedUser({per_page: 100, page})),
        octokit.orgs.listForAuthenticatedUser(),
    ])

    const organizationRepositories = await Promise.all(
        orgsResponse.data.map((org) =>
            fetchPaginated(page => octokit.repos.listForOrg({org: org.login, per_page: 100, page})),
        ),
    )

    const repositories: Repository[] = [...userRepos, ...organizationRepositories.flat()]
    const uniqueRepositories = Array.from(
        new Map<number, Repository>(repositories.map(repo => [repo.id, repo])).values(),
    )
    return {repos: uniqueRepositories, octokit}
}

async function fetchOpenIssuesAndPullsFromAllRepos(accessToken: string): Promise<OpenItemsResponse> {
    const {repos, octokit} = await getAllRepositories(accessToken)
    if (!octokit) return { allIssues: [], allPullRequests: [] }

    const userResponse = await octokit.request("GET /user", {
        headers: {"X-GitHub-Api-Version": "2022-11-28"},
    })

    const login = userResponse.data.login

    const results = await Promise.all(
        repos.map(async (repo) => {
            const owner = repo.owner?.login
            if (!owner) return {issues: [], pulls: []}

            const items = await fetchPaginated(page => octokit.issues.listForRepo({
                owner,
                repo: repo.name,
                state: "open",
                per_page: 100,
                page,
            }))

            const issues = items
                .filter(item => !item.pull_request)
                .filter(item => item.assignees?.some((assignee) => assignee.login === login) || item.assignee?.login === login)

            const pulls = items
                .filter(item => !!item.pull_request)
                .filter(item => item.assignees?.some((assignee) => assignee.login === login) || item.assignee?.login === login)

            return {issues, pulls}
        }),
    )

    return {
        allIssues: results.flatMap(result => result.issues),
        allPullRequests: results.flatMap(result => result.pulls),
    }
}

export const useGithub = () => {
    const {userId} = useSession()
    const {integrations} = useIntegrations(userId)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const {data, isLoading, isFetching, isError, refetch} = useQuery<OpenItemsResponse, Error>(queryOptions({
        queryKey: GITHUB_QUERY_KEY(githubIntegration?.accessToken ?? null),
        queryFn: () => fetchOpenIssuesAndPullsFromAllRepos(githubIntegration?.accessToken!),
        enabled: Boolean(githubIntegration?.accessToken),
    }))

    const issues = data?.allIssues ?? []
    const pullRequests = data?.allPullRequests ?? []

    const allLabels = useMemo(() => {
        const labels = issues.flatMap((issue) => (issue.labels || []) as Label[])
        const uniqueLabels = new Map<string, Label>()
        labels.forEach(label => {
            if (label.name && !uniqueLabels.has(label.name)) {
                uniqueLabels.set(label.name, label)
            }
        })
        return Array.from(uniqueLabels.values())
    }, [issues])

    const filteredIssues = useMemo(() => {
        return issues.filter((issue) => {
            const matchesSearch =
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.repository_url
                    .split('/')
                    .pop()
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())

            const issueLabels = (issue.labels || []) as Label[]
            const matchesLabels = selectedLabels.length === 0 || issueLabels.some((label) => label.name && selectedLabels.includes(label.name))
            return matchesSearch && matchesLabels
        })
    }, [issues, searchQuery, selectedLabels])

    const filteredPRs = useMemo(() => {
        return pullRequests.filter((pr) =>
            pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pr.repository_url
                .split('/')
                .pop()
                ?.toLowerCase()
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
        refetch
    }
}
