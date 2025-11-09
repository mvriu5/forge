import {useMemo, useState} from "react"
import {useQuery} from "@tanstack/react-query"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {Octokit} from "@octokit/rest"

const GITHUB_QUERY_KEY = (accessToken: string | null) => ["githubIssues", accessToken] as const

type UserRepositoryListResponse = Awaited<ReturnType<Octokit["repos"]["listForAuthenticatedUser"]>>
type UserRepository = UserRepositoryListResponse["data"][number]

type OrganizationRepositoryListResponse = Awaited<ReturnType<Octokit["repos"]["listForOrg"]>>
type OrganizationRepository = OrganizationRepositoryListResponse["data"][number]

type Repository = UserRepository | OrganizationRepository

type IssuesListResponse = Awaited<ReturnType<Octokit["issues"]["listForRepo"]>>
type Issue = IssuesListResponse["data"][number]

type OpenItemsResponse = {
    allIssues: Issue[]
    allPullRequests: Issue[]
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

async function fetchOpenIssuesAndPullsFromAllRepos(accessToken: string): Promise<OpenItemsResponse | undefined> {
    const {repos, octokit} = await getAllRepositories(accessToken)
    if (!octokit) return

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
    const {session} = useSession()
    const userId = session?.user?.id
    const {integrations} = useIntegrations(userId)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: GITHUB_QUERY_KEY(githubIntegration?.accessToken ?? null),
        queryFn: () => fetchOpenIssuesAndPullsFromAllRepos(githubIntegration?.accessToken!),
        enabled: Boolean(githubIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false
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
    }
}