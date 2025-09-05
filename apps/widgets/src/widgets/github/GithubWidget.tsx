"use client"

import React, {useState} from "react"
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import {
    CircleDashed,
    Filter,
    FolderOpen,
    GitPullRequest,
    RefreshCw
} from "lucide-react"
import {formatDate} from "date-fns"
import {Button} from "@forge/ui/components/Button"
import {Badge} from "@forge/ui/components/Badge"
import {Input} from "@forge/ui/components/Input"
import {DropdownMenu, MenuItem} from "@forge/ui/components/Dropdown"
import {Tabs, TabsList, TabsTrigger} from "@forge/ui/components/Tabs"
import {Skeleton} from "@forge/ui/components/Skeleton"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import { WidgetError } from "../base/WidgetError"
import {WidgetHeader} from "../base/WidgetHeader"
import {WidgetContent} from "../base/WidgetContent"

type GithubHookReturn = {
    activeTab: string
    setActiveTab: (tab: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedLabels: any[]
    setSelectedLabels: (labels: any) => void
    allLabels: any[]
    filteredIssues: any[]
    filteredPRs: any[]
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    refetch: () => void
    githubIntegration: any
}

interface GithubWidgetProps extends WidgetProps {
    hook: GithubHookReturn
    onIntegrate: () => Promise<void>
}

const GithubWidget: React.FC<GithubWidgetProps> = ({widget, editMode, onWidgetDelete, hook, onIntegrate}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const dropdownFilterItems: MenuItem[] = Array.from(new Set(hook.allLabels.map((label: any) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: `#${label.color}`}}/>,
        key: label.id,
        label: label.name,
        checked: hook.selectedLabels.includes(label),
        onCheckedChange: () => hook.setSelectedLabels((prev: any) => (prev.includes(label) ? prev.filter((l: any) => l !== label) : [...prev, label]))
    }))))

    if (!hook.githubIntegration?.accessToken && !hook.isLoading) {
        return (
            <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Github account first!"}
                    actionLabel={"Integrate"}
                    onAction={onIntegrate}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Github"}>
                <Badge
                    variant="brand"
                    className="text-xs bg-brand/10 border-brand/40 font-mono"
                    title={`${hook.activeTab === "issues" ? hook.filteredIssues.length : hook.filteredPRs.length} open`}
                />
                {hook.activeTab === "issues" &&
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
                            disabled={hook.allLabels.length === 0 || hook.isLoading || hook.isFetching}
                            {...filterTooltip}
                        >
                            <Filter size={16} />
                        </Button>
                    </DropdownMenu>
                }
                <Button
                    variant={"widget"}
                    onClick={() => hook.refetch()}
                    data-loading={(hook.isLoading || hook.isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search..."
                    className="bg-tertiary"
                    value={hook.searchQuery}
                    onChange={(e) => hook.setSearchQuery(e.target.value)}
                />
            </div>
            <Tabs defaultValue="issues" onValueChange={hook.setActiveTab}>
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
                {(hook.isLoading || hook.isFetching) ? (
                    <div className="h-full flex flex-col gap-4 pt-2">
                        <Skeleton className={"h-16 w-full px-2"} />
                        <Skeleton className={"h-16 w-full px-2"} />
                        <Skeleton className={"h-16 w-full px-2"} />
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {hook.activeTab === "issues" && hook.filteredIssues.map((issue: any) => (
                            <IssueCard issue={issue} key={issue.id}/>
                        ))}
                        {hook.activeTab === "pull-requests" && hook.filteredPRs.map((pr: any) => (
                            <PulLRequestCard pr={pr} key={pr.id}/>
                        ))}
                        {hook.activeTab === "issues" && hook.filteredIssues.length === 0 &&
                            <div className={"mt-4 flex justify-center items-center text-sm text-tertiary"}>
                                No results found
                            </div>
                        }
                        {hook.activeTab === "pull-requests" && hook.filteredPRs.length === 0 &&
                            <div className={"mt-4 flex justify-center items-center text-sm text-tertiary"}>
                                No results found
                            </div>
                        }
                    </div>
                )}
            </WidgetContent>
        </WidgetTemplate>
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
                        <span className={"text-tertiary font-mono"}>{formatDate(issue.created_at, "dd/MM/yyyy")}</span>
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
                        <FolderOpen size={14} className="mr-1" />
                        {pr.repository_url.split('/').pop()}
                    </div>
                    <span className={"text-tertiary font-mono"}>{formatDate(pr.created_at, "dd/MM/yyyy")}</span>
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