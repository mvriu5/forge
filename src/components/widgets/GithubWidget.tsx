"use client"

import type React from "react"
import {useCallback, useEffect, useState} from "react"
import {fetchOpenIssuesAndPullsFromAllRepos} from "@/actions/github"
import {WidgetTemplate} from "./WidgetTemplate"
import {
    Badge,
    Button, Callout,
    DropdownMenu,
    Input,
    ScrollArea,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
    tooltip, useToast
} from "lunalabs-ui"
import {
    AlertCircle, Blocks,
    CloudAlert,
    Filter,
    FolderGit,
    GitGraphIcon,
    GitPullRequest,
    RefreshCw,
    TriangleAlert
} from "lucide-react"
import {formatDate} from "date-fns"
import type {MenuItem} from "@/lib/menu-types"
import {useIntegrationStore} from "@/store/integrationStore"
import {authClient} from "@/lib/auth-client"
import {shouldRefetchData, useGithubStore} from "@/store/githubStore"

interface GithubWidgetProps {
    editMode: boolean
}

const GithubWidget: React.FC<GithubWidgetProps> = ({editMode}) => {
    const {githubIntegration} = useIntegrationStore()
    const { data, loading, setLoading, setData } = useGithubStore()
    const {addToast} = useToast()

    const [activeTab, setActiveTab] = useState<string>("issues")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "bc",
    })

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

    const allLabels = Array.from(new Set(data.issues
        .flatMap((issue) => issue.labels || [])
        .filter((label, index, self) => index === self.findIndex((l) => l.name === label.name))))

    const dropdownFilterItems: MenuItem[] = Array.from(new Set(allLabels.map((label) => ({
        type: "checkbox",
        key: label.id,
        label: label.name,
        checked: selectedLabels.includes(label),
        onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
    }))))

    const fetchData = useCallback((force: boolean = false) => {
        if (!githubIntegration?.accessToken) return
        if (!force && !shouldRefetchData(data.lastFetched)) return
        setLoading(true)

        fetchOpenIssuesAndPullsFromAllRepos(githubIntegration.accessToken).then((data) => {
            if (!data) return

            const seenIssueIds = new Set<number>()
            const seenPrIds = new Set<number>()

            const fIssues = data.allIssues.filter(item => {
                if (seenIssueIds.has(item.id)) {
                    return false
                }
                seenIssueIds.add(item.id)
                return true
            })

            const fPrs = data.allPullRequests.filter(item => {
                if (seenPrIds.has(item.id)) {
                    return false
                }
                seenPrIds.add(item.id)
                return true
            })

            setData({ issues: fIssues, pullRequests: fPrs })
            setLoading(false)
        })
    }, [fetchOpenIssuesAndPullsFromAllRepos, githubIntegration, data.lastFetched, setData, setLoading])

    useEffect(() => {
        fetchData()
    }, [fetchData])

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
        pr.repository_url.split('/').pop().toLowerCase().includes(searchQuery.toLowerCase()))

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({provider: "github", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
                addToast({
                    title: "Successfully integrated Github",
                    icon: <Blocks size={24}/>
                })
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
            }
        })
    }

    if (!githubIntegration?.accessToken) {
        return (
            <WidgetTemplate className="col-span-1 row-span-2" name={"github"} editMode={editMode}>
                <div className="h-full flex flex-col gap-2 items-center justify-center ">
                    <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                        <TriangleAlert size={32}/>
                        If you want to use this widget, you need to integrate your Github account first!
                    </Callout>
                    <Button variant="default" className={"w-max"} onClick={handleIntegrate}>
                        Integrate
                    </Button>
                </div>
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate className="col-span-1" name={"github"} editMode={editMode}>
            <div className="h-full flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className={"flex items-center gap-2"}>
                        <GitGraphIcon size={18} className={"text-brand"}/>
                        <p className={"text-lg text-primary font-medium"}>Github</p>
                    </div>
                    <Badge
                        variant="brand"
                        className="text-xs font-normal bg-brand/10 border-brand/40"
                        title={`${activeTab === "issues" ? data.issues.length : data.pullRequests.length} open`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search..."
                        className="bg-tertiary ring-brand/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {activeTab === "issues" &&
                        <DropdownMenu asChild items={dropdownFilterItems} align={"end"}>
                            <Button className={"px-2"} {...filterTooltip}>
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenu>
                    }
                    <Button
                        className={"px-2 group"}
                        onClick={() => fetchData(true)}
                        data-loading={loading ? "true" : "false"}
                        {...refreshTooltip}
                    >
                        <RefreshCw
                            className="h-4 w-4 group-data-[loading=true]:animate-spin" />
                    </Button>
                </div>
                <Tabs defaultValue="issues" onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-2 bg-secondary rounded-md">
                        <TabsTrigger value="issues">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Issues
                        </TabsTrigger>
                        <TabsTrigger value="pull-requests">
                            <GitPullRequest className="h-4 w-4 mr-2" />
                            Pull Requests
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                {loading ? (
                    <div className="h-full grid grid-cols-1 gap-4 pt-2">
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                    </div>
                    ) : (
                    <ScrollArea className={"h-full"} thumbClassname={"bg-primary"}>
                        {activeTab === "issues" && filteredIssues.map((issue) => (
                            <IssueCard issue={issue} key={issue.id}/>
                        ))}
                        {activeTab === "pull-requests" && filteredPRs.map((pr) => (
                            <PulLRequestCard pr={pr} key={pr.id}/>
                        ))}
                        {activeTab === "issues" && filteredIssues.length === 0 &&
                            <div className={"flex justify-center items-center text-tertiary"}>
                                No results found
                            </div>
                        }
                        {activeTab === "pull-requests" && filteredPRs.length === 0 &&
                            <div className={"flex justify-center items-center text-tertiary"}>
                                No results found
                            </div>
                        }
                    </ScrollArea>
                )}
            </div>
        </WidgetTemplate>
    )
}


const IssueCard = ({issue}: { issue: any }) => {
    return (
        <a href={issue.html_url}>
            <div
                key={issue.id}
                className="flex items-start gap-2 p-2 pr-4 mb-2 rounded-md hover:bg-secondary cursor-pointer"
            >
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm text-primary">{issue.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <FolderGit size={14} className="mr-1" />
                            {issue.repository_url.split('/').pop()}
                        </div>
                        <span className={"text-tertiary"}>{formatDate(issue.created_at, "dd.MM.yyyy")}</span>
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
        <div
            key={pr.id}
            className="flex items-start gap-2 p-2 pr-4 mb-2 rounded-md hover:bg-secondary cursor-pointer"
            onClick={() => window.open(pr.html_url, '_blank', 'noopener,noreferrer')}
        >
            <GitPullRequest
                className={"h-5 w-5 text-blue-500 mt-0.5"}
            />
            <div className="flex-1 space-y-1">
                <p className="font-medium text-sm text-primary">{pr.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <FolderGit size={14} className="mr-1" />
                        {pr.repository_url.split('/').pop()}
                    </div>
                    <span className={"text-tertiary"}>{formatDate(pr.created_at, "dd.MM.yyyy")}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                    {pr.labels.map((label: any) => (
                        <Badge key={label.id} title={label.name} variant={"default"} className="text-xs px-1.5 py-0" style={{color: `#${label.color}`}}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export {GithubWidget}