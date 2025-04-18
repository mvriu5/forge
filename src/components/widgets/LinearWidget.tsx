"use client"

import type React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {Callout} from "@/components/ui/Callout"
import {Blocks, Box, Captions, CloudAlert, Hourglass, TriangleAlert, Users} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {SortOption, useLinear} from "@/hooks/useLinear"
import {authClient} from "@/lib/auth-client"
import {useToast} from "@/components/ui/ToastProvider"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {tooltip} from "@/components/ui/TooltipProvider"
import {hexToRgba} from "@/lib/utils"
import {StatusBadge} from "@/components/widgets/components/StatusBadge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"

const LinearWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {linearIntegration, data, isLoading, isFetching, isError, refetch, sortBy, setSortBy} = useLinear()
    const {addToast} = useToast()

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
            <WidgetTemplate className="col-span-1 row-span-2" name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <div className="h-full flex flex-col gap-2 items-center justify-center">
                    <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                        <TriangleAlert size={32}/>
                        If you want to use this widget, you need to integrate your Linear account first!
                    </Callout>
                    <Button variant="default" className={"w-max"} onClick={handleIntegrate}>
                        Integrate
                    </Button>
                </div>
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate className="col-span-2 row-span-2" name={"linear"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className="h-full flex flex-col gap-2">

                <div className="flex items-center gap-2 justify-between">
                    <p className={"text-primary text-lg font-semibold"}>Linear Issues</p>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-[200px]">
                            <div className="flex items-center">
                                <span className="text-sm text-tertiary">Sort by:</span>
                                <SelectValue placeholder="Sort" />
                            </div>
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="created">Creation Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
                    <div className={"grid grid-cols-2 gap-4"}>
                        {data?.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
                    </div>
                </ScrollArea>
            </div>
        </WidgetTemplate>
    )
}

const IssueCard = ({issue}: {issue: any}) => {

    const descriptionTooltip = tooltip<HTMLDivElement>({
        message: issue.description
    })

    return (
        <div className={"flex flex-col gap-2 bg-secondary rounded-md p-2 border border-main/20 shadow-md"}>
            <div className="flex items-center gap-2">
                <StatusBadge statusId={issue.stateName}/>
                <p className={"text-primary text-sm truncate"}>{issue.title}</p>
                <div className={"flex items-center justify-center"} {...descriptionTooltip}>
                    <Captions className={"text-tertiary"} size={18}/>
                </div>
            </div>
            <p className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Hourglass size={14}/>
                Priority:
                <span className={"inline break-words text-secondary"}>{issue.priorityName ?? "No priority"}</span>
            </p>
            <p className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Users size={14}/>
                Team:
                <span className={"inline break-words text-secondary"}>{issue.team ?? "No team"}</span>
            </p>
            <p className={"flex items-center gap-1.5 text-tertiary text-xs text-wrap"}>
                <Box size={14}/>
                Project:
                <span className={"inline break-words text-secondary"}>{issue.project ?? "No project"}</span>
            </p>
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

export {LinearWidget}
