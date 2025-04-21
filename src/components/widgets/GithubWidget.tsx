"use client"

import React, {useState} from "react"
import {WidgetProps, WidgetTemplate} from "./WidgetTemplate"
import {
    AlertCircle,
    Blocks,
    CloudAlert,
    Filter,
    FolderGit,
    Github,
    GitPullRequest,
    RefreshCw,
    TriangleAlert
} from "lucide-react"
import {formatDate} from "date-fns"
import {authClient} from "@/lib/auth-client"
import {Callout} from "@/components/ui/Callout"
import {Button} from "@/components/ui/Button"
import {Badge} from "@/components/ui/Badge"
import {Input} from "@/components/ui/Input"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/Tabs"
import {Skeleton} from "@/components/ui/Skeleton"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {useToast} from "@/components/ui/ToastProvider"
import {tooltip} from "@/components/ui/TooltipProvider"
import {useGithub} from "@/hooks/useGithub"

const GithubWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {activeTab, setActiveTab, searchQuery, setSearchQuery, selectedLabels, setSelectedLabels, allLabels, filteredIssues, filteredPRs, isLoading, isFetching, isError, refetch, githubIntegration} = useGithub()
    const {addToast} = useToast()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "bc",
    })

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

    const dropdownFilterItems: MenuItem[] = Array.from(new Set(allLabels.map((label) => ({
        type: "checkbox",
        key: label.id,
        label: label.name,
        checked: selectedLabels.includes(label),
        onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
    }))))

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

    if (!githubIntegration?.accessToken && !isLoading) {
        return (
            <WidgetTemplate className="col-span-1 row-span-2" name={"github"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <div className="h-full flex flex-col gap-2 items-center justify-center">
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
        <WidgetTemplate className="col-span-1 row-span-2" name={"github"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className="h-full flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className={"flex items-center gap-1"}>
                        <Github size={20}/>
                        <p className={"text-lg text-primary font-medium"}>Github</p>
                    </div>
                    <Badge
                        variant="brand"
                        className="text-xs bg-brand/10 border-brand/40 font-mono"
                        title={`${activeTab === "issues" ? filteredIssues.length : filteredPRs.length} open`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search..."
                        className="bg-tertiary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                className={"px-2 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                                disabled={allLabels.length === 0}
                                {...filterTooltip}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenu>
                    }
                    <Button
                        className={"px-2 group"}
                        onClick={() => refetch()}
                        data-loading={isLoading ? "true" : "false"}
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
                {(isLoading || isFetching) ? (
                    <div className="h-full grid grid-cols-1 gap-4 pt-2">
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                        <Skeleton className={"h-full w-full px-2"} />
                    </div>
                    ) : (
                    <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
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
                <AlertCircle className="h-5 w-5 text-info mt-0.5" />
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
            <GitPullRequest className={"h-5 w-5 text-info-500 mt-0.5"}/>
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