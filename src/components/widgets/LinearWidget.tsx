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
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

const LinearWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {session} = useSession()
    const userId = session?.user?.id
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const linearIntegration = getIntegrationByProvider(integrations, "linear")
    const {data, isLoading, isFetching, isError, refetch, sortBy, setSortBy} = useLinear()
    const {addToast} = useToast()

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

    const handleIntegrate = async () => {
        await authClient.signIn.social({provider: "linear", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
                void refetchIntegrations()
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
            <WidgetTemplate id={id} widget={widget} name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Linear account first!"}
                    actionLabel={"Integrate"}
                    onAction={handleIntegrate}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate id={id} widget={widget} name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                    variant={"widget"}
                    className={"group"}
                    onClick={() => refetch()}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {(isLoading || isFetching) ? (
                    <div className={"h-full flex flex-col gap-2"}>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                        <Skeleton className={"h-16"}/>
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
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
