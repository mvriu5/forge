"use client"

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { DropdownMenu, MenuItem } from "@/components/ui/Dropdown"
import { Input } from "@/components/ui/Input"
import { Skeleton } from "@/components/ui/Skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useNotifications } from "@/hooks/data/useNotifications"
import { useSettings } from "@/hooks/data/useSettings"
import { WidgetProps } from "@/lib/definitions"
import { queryOptions } from "@/lib/queryOptions"
import { defineWidget } from "@/lib/widget"
import { Octokit } from "@octokit/rest"
import { useQuery } from "@tanstack/react-query"
import { CircleDashed, Filter, FolderOpen, GitPullRequest, RefreshCw } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

// from useGithub.ts
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


const formatShortDate = (iso?: string | number | Date | null) => {
    if (!iso) return ""
    const d = iso instanceof Date ? iso : new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

const GithubWidget: React.FC<WidgetProps> = ({ widget }) => {
    const {settings} = useSettings(widget.userId)
    const {sendGithubNotification} = useNotifications(widget.userId)
    const {integrations} = useIntegrations(widget.userId)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>("issues")

    const {data, isLoading, isFetching, refetch} = useQuery<OpenItemsResponse, Error>(queryOptions({
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

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const dropdownFilterItems: MenuItem[] = allLabels
        .filter((label): label is typeof label & { name: string } => !!label.name)
        .map((label) => ({
            type: "checkbox",
            icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: `#${label.color}`}}/>,
            key: label.id,
            label: label.name,
            checked: selectedLabels.includes(label.name),
            onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label.name) ? prev.filter((name) => name !== label.name) : [...prev, label.name]))
        }))

    useEffect(() => {
        if (isLoading) return
        if (!settings?.config.todoReminder) return

        const hasPendingIssues = filteredIssues.length > 0
        const hasPendingPRs = filteredPRs.length > 0

        if (!hasPendingIssues && !hasPendingPRs) return

        void sendGithubNotification({
            message: "You have pending GitHub items to review.",
            type: "reminder",
            issues: filteredIssues.length,
            pullRequests: filteredPRs.length
        })
    }, [sendGithubNotification, isLoading, settings?.config.todoReminder, filteredIssues, filteredPRs])

    return (
        <>
            <WidgetHeader title={"Github"}>
                <Badge
                    variant="brand"
                    className="text-xs bg-brand/10 border-brand/40 font-mono"
                    title={`${activeTab === "issues" ? filteredIssues.length : filteredPRs.length} open`}
                />
                {activeTab === "issues" &&
                    <DropdownMenu
                        asChild
                        items={dropdownFilterItems}
                        align={"end"}
                        open={dropdownOpen}
                        onOpenChange={setDropdownOpen}
                    >
                        <Button
                            data-state={dropdownOpen ? "open" : "closed"}
                            variant={"widget"}
                            className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                            disabled={allLabels.length === 0 || isLoading || isFetching}
                            {...filterTooltip}
                        >
                            <Filter size={16} />
                        </Button>
                    </DropdownMenu>
                }
                <Button
                    variant={"widget"}
                    onClick={() => refetch()}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search..."
                    className="bg-tertiary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Tabs defaultValue="issues" onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2 bg-secondary rounded-md">
                    <TabsTrigger value="issues">
                        Issues
                    </TabsTrigger>
                    <TabsTrigger value="pull-requests">
                        Pull Requests
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <WidgetContent scroll>
                {(isLoading || isFetching) ? (
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {activeTab === "issues" && filteredIssues.map((issue) => (
                            <IssueCard issue={issue} key={issue.id}/>
                        ))}
                        {activeTab === "pull-requests" && filteredPRs.map((pr) => (
                            <PulLRequestCard pr={pr} key={pr.id}/>
                        ))}
                        {activeTab === "issues" && filteredIssues.length === 0 &&
                            <div className={"mt-4 flex justify-center items-center text-sm text-tertiary"}>
                                No results found
                            </div>
                        }
                        {activeTab === "pull-requests" && filteredPRs.length === 0 &&
                            <div className={"mt-4 flex justify-center items-center text-sm text-tertiary"}>
                                No results found
                            </div>
                        }
                    </div>
                )}
            </WidgetContent>
        </>
    )
}


const IssueCard = ({issue}: { issue: any }) => {
    return (
        <a href={issue.html_url}>
            <div
                key={issue.id}
                className="flex items-start gap-2 p-2 pr-4 rounded-md hover:bg-secondary cursor-pointer"
            >
                <CircleDashed size={16} className="text-warning mt-0.5" />
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm text-primary">{issue.title}</p>
                    <div className="flex items-center justify-between text-xs text-secondary">
                        <div className="flex items-center">
                            <FolderOpen size={14} className="mr-1" />
                            {issue.repository_url.split('/').pop()}
                        </div>
                        <span className={"text-tertiary font-mono"}>{formatShortDate(issue.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {issue.labels.map((label: any) => (
                            <Badge key={label.id} title={label.name} variant={"default"} className="text-xs px-1.5 py-0" style={{color: `#${label.color}`}}/>
                        ))}
                    </div>
                </div>
            </div>
        </a>
    )
}

const PulLRequestCard = ({pr}: {pr: any}) => {
    return (
        <Link
            href={pr.html_url}
            target={"_blank"}
            rel={"noopener noreferrer"}
        >
            <div
                key={pr.id}
                className="flex items-start gap-2 p-2 pr-4 mb-2 rounded-md hover:bg-second"
            >
                <GitPullRequest className={"h-5 w-5 text-info-500 mt-0.5"}/>
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm text-primary">{pr.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <FolderOpen size={14} className="mr-1" />
                            {pr.repository_url.split('/').pop()}
                        </div>
                        <span className={"text-tertiary font-mono"}>{formatShortDate(pr.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {pr.labels.map((label: any) => (
                            <Badge key={label.id} title={label.name} variant={"default"} className="text-xs px-1.5 py-0" style={{color: `#${label.color}`}}/>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export const githubWidgetDefinition = defineWidget({
    name: "Github",
    integration: "github",
    component: GithubWidget,
    description: "See your open github issues & pull requests.",
    image: "/github_preview.svg",
    tags: ["github"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    }
})
