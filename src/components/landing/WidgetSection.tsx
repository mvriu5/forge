"use client"

import React from "react"
import {Bookmark, Box, Captions, Hourglass, Link, Users} from "lucide-react"
import {cn, hexToRgba} from "@/lib/utils"
import {SelectorItems} from "@/components/widgets/components/NodeSelector"
import {Button} from "@/components/ui/Button"
import {getLogoFromLink} from "@/components/svg/BookmarkIcons"
import {LinearIcon} from "@/components/svg/LinearIcon"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {StatusBadge} from "@/components/widgets/components/StatusBadge"

function WidgetSection() {
    return (
        <div className={"flex flex-col gap-4 md:px-8"}>
            <p className="flex items-center gap-1.5 font-semibold text-3xl text-brand">
                Discover a variety of widgets
            </p>
            <div className={"h-px w-full rounded-full bg-tertiary"}/>
            <p className="text-xl text-tertiary font-normal">
                Explore all widgets and build your dashboard with an unique style.
            </p>
            <div className={"grid grid-cols-1 2xl:grid-cols-2 auto-rows-[minmax(120px,120px)] gap-8 pt-8"}>
                <BentoLinear/>
                <BentoBookmark/>
                <BentoMarkdown/>
            </div>
        </div>
    )
}

const BentoMarkdown = () => {
    return (
        <div
            className={"relative col-span-1 2xl:col-span-2 row-span-2 flex flex-col gap-4 rounded-md border border-main/20 shadow-xl p-8 overflow-hidden cursor-default pointer-events-none bg-secondary text-sm"}>

            <div className={"w-max flex flex-col 2xl:flex-row 2xl:items-center gap-2"}>
                <h1>My Epic Hiking Adventure Through the</h1>
                <div className={"relative bg-brand"}>
                    <h1 className={"text-primary"}>Majestic Rocky Mountain Wilderness</h1>
                    <EditorBubbleWindow/>
                </div>
            </div>
            <hr className={"border-b border-main/60"}/>
            <h2>Highlights</h2>
            <ul>
                <li><strong>Breathtaking Views</strong> from the summit at sunrise 🌄</li>
                <li>Encountered a herd of <strong>elk</strong> 🦌 (<em>never been so close before</em>)</li>
                <li>
                    <del>Rained on the second day</del>
                    – luckily the trail held up
                </li>
                <li><strong>New personal record</strong>: 30 km in 2 days</li>
            </ul>
            <hr className={"border-b border-main/60"}/>

        </div>

    )
}

const EditorBubbleWindow = () => {
    return (
        <div className={"z-20 absolute -top-2 -right-2 translate-x-full flex flex-col gap-1 h-80 w-48 p-1 bg-primary border border-main/60 shadow-lg rounded-md"}>
            {SelectorItems.map((item) => (
                <div
                    key={item.name}
                    data-state={item.name === "Heading 1" ? "active" : "unactive"}
                    className='group flex cursor-pointer items-center justify-between data-[state=active]:bg-secondary data-[state=active]:border border-main/40 rounded-sm px-2 py-1 text-sm hover:bg-secondary'>
                    <div className='flex items-center space-x-2'>
                        <div className='rounded-sm border border-main/60 p-1 group-hover:text-brand'>
                            <item.icon className='h-3 w-3 group-data-[state=active]:text-brand'/>
                        </div>
                        <span className={"text-secondary group-data-[state=active]:text-primary group-data-[state=active]:font-semibold"}>{item.name}</span>
                    </div>
                </div>
            ))}
        </div>

    )
}

const BentoBookmark = () => {
    return (
        <div className={"col-span-1 row-span-1 h-full flex flex-col gap-2 p-4 bg-secondary rounded-md px-4 shadow-xl border border-main/20 overflow-hidden cursor-default pointer-events-none"}>
            <div className={"flex items-center justify-between gap-2"}>
                <p className={"text-primary text-lg font-semibold"}>Bookmarks</p>
                <Button className={"bg-tertiary gap-1 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
                    <Bookmark size={18}/>
                    Add
                </Button>
            </div>
            <div className={"w-full h-px border-b border-main/40"}/>
            <div
                className={"group w-full flex items-center gap-2 rounded-md hover:bg-secondary py-2 cursor-pointer overflow-hidden"}
            >
                <div className={"flex justify-center items-center p-1 rounded-md bg-white/10"}>
                    {getLogoFromLink("amazon.com")}
                </div>
                <p className={"text-primary truncate"}>{"My Amazon shopping list"}</p>
                <div className={"h-4 w-px border-r border-main"}/>
                <Link size={12}/>
            </div>
        </div>
    )
}

const BentoLinear = () => {
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
        <div className="col-span-1 row-span-2 flex flex-col gap-2 bg-secondary rounded-md p-4 shadow-xl border border-main/20 overflow-hidden cursor-default pointer-events-none">
            <div className="flex items-center gap-2 justify-between">
                <div className={"flex items-center gap-1"}>
                    <LinearIcon/>
                    <p className={"text-primary text-sm md:text-lg font-semibold"}>Linear Issues</p>
                </div>
                <div className={"flex items-center gap-2"}>
                    <Select value={"priority"}>
                        <SelectTrigger className="w-max bg-secondary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-tertiary">Sort by:</span>
                                <SelectValue placeholder="Sort" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="created">Creation Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className={"grid grid-cols-2 gap-4"}>
                {issues.map((issue) => <IssueCard key={issue.id} issue={issue} className={"bg-tertiary"}/>)}
            </div>
        </div>
    )
}

const IssueCard = ({issue, className}: {issue: any, className?: string}) => {

    const descriptionTooltip = useTooltip<HTMLDivElement>({
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

export {WidgetSection}