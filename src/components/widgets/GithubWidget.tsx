"use client"

import React, {useState} from "react"
import {WidgetProps, WidgetTemplate} from "./base/WidgetTemplate"
import {
    AlertCircle,
    Blocks,
    CircleDashed,
    CloudAlert,
    Filter,
    FolderGit,
    FolderOpen,
    GitPullRequest,
    RefreshCw
} from "lucide-react"
import {formatDate} from "date-fns"
import {authClient} from "@/lib/auth-client"
import {Button} from "@/components/ui/Button"
import {Badge} from "@/components/ui/Badge"
import {Input} from "@/components/ui/Input"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/Tabs"
import {Skeleton} from "@/components/ui/Skeleton"
import {useToast} from "@/components/ui/ToastProvider"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {useGithub} from "@/hooks/useGithub"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

const GithubWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {userId} = useSession()
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")
    const {activeTab, setActiveTab, searchQuery, setSearchQuery, selectedLabels, setSelectedLabels, allLabels, filteredIssues, filteredPRs, isLoading, isFetching, isError, refetch} = useGithub()
    const {addToast} = useToast()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const dropdownFilterItems: MenuItem[] = Array.from(new Set(allLabels.map((label) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: `#${label.color}`}}/>,
        key: label.id,
        label: label.name,
        checked: selectedLabels.includes(label),
        onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
    }))))

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({provider: "github", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
                void refetchIntegrations()
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

    const hasError = !githubIntegration?.accessToken && !isLoading

    return (
        <WidgetTemplate id={id} widget={widget} name={"github"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            {hasError ? (
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Github account first!"}
                    actionLabel={"Integrate"}
                    onAction={handleIntegrate}
                />
            ) : (
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
                            <div className="h-full flex flex-col gap-4 pt-2">
                                <Skeleton className={"h-16 w-full px-2"} />
                                <Skeleton className={"h-16 w-full px-2"} />
                                <Skeleton className={"h-16 w-full px-2"} />
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
            )}

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