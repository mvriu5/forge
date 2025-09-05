"use client"

import type React from "react"
import {Box, Captions, Hourglass, RefreshCw, Users} from "lucide-react"
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import {WidgetError} from "../base/WidgetError"
import {WidgetHeader} from "../base/WidgetHeader"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@forge/ui/components/Select"
import {Button} from "@forge/ui/components/Button"
import {WidgetContent} from "../base/WidgetContent"
import {Skeleton} from "@forge/ui/components/Skeleton"
import {StatusBadge} from "../components/StatusBadge"
import {cn, hexToRgba} from "@forge/ui/lib/utils"

type LinearHookReturn = {
    linearIntegration: any
    data: any[] | null
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    refetch: () => void
    sortBy: "priority" | "created"
    setSortBy: (option: "priority" | "created") => void
}

interface LinearWidgetProps extends WidgetProps {
    onIntegrate: () => Promise<void>
    hook: LinearHookReturn
}

const LinearWidget: React.FC<LinearWidgetProps> = ({widget, editMode, onWidgetDelete, onIntegrate, hook}) => {
    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

    if (!hook.linearIntegration?.accessToken && !hook.isLoading) {
        return (
            <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Linear account first!"}
                    actionLabel={"Integrate"}
                    onAction={onIntegrate}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Linear"}>
                <Select value={hook.sortBy} onValueChange={(value) => hook.setSortBy(value as "priority" | "created")}>
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
                    variant={"widget"}
                    className={"group"}
                    onClick={() => hook.refetch()}
                    data-loading={(hook.isLoading || hook.isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {(hook.isLoading || hook.isFetching) ? (
                    <div className={"h-full flex flex-col gap-2"}>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {hook.data?.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
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
        <div className={cn("flex flex-col gap-2 bg-secondary rounded-md p-1 border border-main/20 shadow-xs dark:shadow-md", className)}>
            <div className={"flex items-center gap-2"}>
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
            <p className={"text-tertiary text-xs font-mono"}>{new Date(issue.createdAt).toLocaleDateString("en-US")}</p>
        </div>
    )
}

export {IssueCard, LinearWidget}
