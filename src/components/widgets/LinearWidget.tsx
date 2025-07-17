"use client"

import type React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {Callout} from "@/components/ui/Callout"
import {Blocks, Box, Captions, CloudAlert, Hourglass, RefreshCw, TriangleAlert, Users} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {SortOption, useLinear} from "@/hooks/useLinear"
import {authClient} from "@/lib/auth-client"
import {useToast} from "@/components/ui/ToastProvider"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {tooltip} from "@/components/ui/TooltipProvider"
import {cn, hexToRgba} from "@/lib/utils"
import {StatusBadge} from "@/components/widgets/components/StatusBadge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {LinearIcon} from "@/components/svg/LinearIcon"
import {Skeleton} from "@/components/ui/Skeleton"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetError} from "@/components/widgets/base/WidgetError"

const LinearWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        const issues = [
            {
                id: "27f60088-dd2e-4b8f-9e79-7db941ae1327",
                title: "Deprecated Feature Cleanup",
                description: "Remove outdated legacy code and unused assets to streamline the codebase.",
                stateName: "Canceled",
                labels: [{ name: "Maintenance", color: "#ffd966" }],
                priority: 1,
                priorityName: "Low",
                url: "https://linear.app/noque/issue/MA-216/deprecated-feature-cleanup",
                project: "Maintenance",
                team: "Backend Team",
                createdAt: "Sat Apr 19 2025 19:50:40 GMT+0200 (CEST)",
                updatedAt: "Sun Apr 20 2025 21:48:20 GMT+0200 (CEST)"
            },
            {
                id: "41747d7e-47b8-42d8-9648-0fa0b04c9efa",
                title: "Enable Emoji Support in Chat",
                description: "Allow users to select and insert emojis in chat messages.",
                stateName: "In Progress",
                labels: [{ name: "User Interface", color: "#a4c2f4" }],
                priority: 2,
                priorityName: "Medium",
                url: "https://linear.app/noque/issue/MA-214/enable-emoji-support-in-chat",
                project: "Messaging UI",
                team: "Front-End Team",
                createdAt: "Sat Oct 05 2024 14:15:24 GMT+0200 (CEST)",
                updatedAt: "Sat Oct 05 2024 14:15:24 GMT+0200 (CEST)"
            },
            {
                id: "341bb5fa-4fae-4d41-bb24-35e6cc5b31e6",
                title: "Responsive Toolbar Component",
                description: "Develop a toolbar that adapts to desktop and mobile layouts.",
                stateName: "Done",
                labels: [{ name: "Component", color: "#bec2c8" }],
                priority: 3,
                priorityName: "High",
                url: "https://linear.app/noque/issue/MA-206/responsive-toolbar-component",
                project: "UI Components",
                team: "Front-End Team",
                createdAt: "Thu Sep 05 2024 20:33:20 GMT+0200 (CEST)",
                updatedAt: "Sat Apr 19 2025 19:50:30 GMT+0200 (CEST)"
            },
            {
                id: "dc144749-a13f-46e8-bc66-267fde577ba2",
                title: "Responsive Scheduler Widget",
                description: "Design and implement a scheduler widget optimized for all screen sizes.",
                stateName: "Backlog",
                labels: [{ name: "UX", color: "#e2aaff" }],
                priority: 2,
                priorityName: "Medium",
                url: "https://linear.app/noque/issue/MA-202/responsive-scheduler-widget",
                project: "Dashboard Widgets",
                team: "UX Team",
                createdAt: "Thu Sep 05 2024 20:27:52 GMT+0200 (CEST)",
                updatedAt: "Sat Apr 19 2025 19:50:24 GMT+0200 (CEST)"
            }
        ]

        return (
            <WidgetTemplate id={id} name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader title={"Linear"}>
                    <Select>
                        <SelectTrigger className="w-max h-6 shadow-none dark:shadow-none border-0 bg-tertiary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-tertiary text-nowrap">Sort by:</span>
                                <SelectValue placeholder="Sort" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={"border-main/40"}>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="created">Creation Date</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        className={"px-2 h-6 border-0 shadow-none dark:shadow-none group"}
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </WidgetHeader>
                <WidgetContent scroll>
                    <div className={"grid grid-cols-2 gap-4"}>
                        {issues?.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
                    </div>
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const {linearIntegration, data, isLoading, isFetching, isError, refetch, sortBy, setSortBy} = useLinear()
    const {addToast} = useToast()

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

    const handleIntegrate = async () => {
        await authClient.signIn.oauth2({providerId: "linear", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
                addToast({
                    title: "Successfully integrated Linear",
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

    if (!linearIntegration?.accessToken && !isLoading) {
        return (
            <WidgetTemplate id={id} name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Linear account first!"}
                    actionLabel={"Integrate"}
                    onAction={handleIntegrate}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate id={id} name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Linear"}>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-max transition-all bg-tertiary border-0 shadow-none dark:shadow-none h-6 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-tertiary text-nowrap">Sort by:</span>
                            <SelectValue placeholder="Sort" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="created">Creation Date</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    className={"px-2 h-6 border-0 shadow-none dark:shadow-none group"}
                    onClick={() => refetch()}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw
                        className="h-4 w-4 group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {(isLoading || isFetching) ? (
                    <div className={"h-full grid grid-cols-2 gap-4"}>
                        <Skeleton className={"col-span-1 h-38"}/>
                        <Skeleton className={"col-span-1 h-38"}/>
                        <Skeleton className={"col-span-1 h-38"}/>
                        <Skeleton className={"col-span-1 h-38"}/>
                    </div>
                ) : (
                    <div className={"grid grid-cols-2 gap-4"}>
                        {data?.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
                    </div>
                )}
            </WidgetContent>
        </WidgetTemplate>
    )
}

const IssueCard = ({issue, className}: {issue: any, className?: string}) => {

    const descriptionTooltip = tooltip<HTMLDivElement>({
        message: issue.description
    })

    return (
        <div className={cn("flex flex-col gap-2 bg-secondary rounded-md p-2 border border-main/20 shadow-md", className)}>
            <div className="flex items-center gap-2">
                <StatusBadge statusId={issue.stateName}/>
                <p className={"text-primary text-sm truncate"}>{issue.title}</p>
                <div className={"hidden lg:flex items-center justify-center"} {...descriptionTooltip}>
                    {issue.description?.length > 0 &&
                        <Captions className={"text-tertiary"} size={18}/>
                    }
                </div>
            </div>
            <span className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Hourglass size={14}/>
                <p className={"hidden lg:flex"}>Priority:</p>
                <span className={"inline break-words text-secondary text-nowrap text-truncate"}>{issue.priorityName ?? "No priority"}</span>
            </span>
            <span className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Users size={14}/>
                <p className={"hidden lg:flex"}>Team:</p>
                <span className={"inline break-words text-secondary text-nowrap text-truncate"}>{issue.team ?? "No team"}</span>
            </span>
            <span className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Box size={14}/>
                <p className={"hidden lg:flex"}>Project:</p>
                <span className={"inline break-words text-secondary text-nowrap text-truncate"}>{issue.project ?? "No project"}</span>
            </span>
            <div className={"flex items-center gap-2"}>
                {issue.labels.map((label: any) =>
                    <div
                        key={label.name}
                        className={"px-1 rounded-full"}
                        style={{
                            backgroundColor: hexToRgba(label.color, 0.05),
                            borderWidth: "1px",
                            borderColor: hexToRgba(label.color, 0.4),
                        }}
                    >
                        <p className={"text-xs"} style={{color: label.color}}>{label.name}</p>
                    </div>
                )}
            </div>
            <p className={"text-tertiary text-end text-xs font-mono"}>{new Date(issue.createdAt).toLocaleDateString("en-US")}</p>
        </div>
    )
}

export {IssueCard, LinearWidget}
