import type React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {GoogleSheets} from "@/components/svg/BookmarkIcons"
import {Button} from "@/components//ui/Button"
import {Bookmark, Link, Trash} from "lucide-react"
import {tooltip} from "@/components/ui/TooltipProvider"

const BookmarkWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {

    return (
        <WidgetTemplate className={"col-span-1 row-span-2"} name={"bookmark"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className={"h-full flex flex-col gap-2"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <p className={"text-primary text-lg font-semibold"}>Bookmarks</p>
                    <Button className={"bg-secondary gap-1"}>
                        <Bookmark size={18}/>
                        Create
                    </Button>
                </div>
                <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
                    <BookmarkItem title={"Tracking Sheets"} link={"https://docs.google.com/spreadsheets/d/1aaNnGiMpeqNONmiMwASHuMzlmdOzqEKTvSvQPv1fKIA"}/>
                </ScrollArea>
            </div>
        </WidgetTemplate>
    )
}

interface BookmarkProps {
    title: string
    link: string
}

const BookmarkItem = ({title, link}: BookmarkProps) => {

    const linkTooltip = tooltip<HTMLDivElement>({
        message: link
    })

    return (
        <div className={"group w-full flex items-center gap-2 justify-between rounded-md hover:bg-secondary p-2 cursor-pointer overflow-hidden"}>
            <div className={"flex items-center gap-2"}>
                <div className={"flex justify-center items-center p-1 rounded-md bg-white/10"}>
                    <GoogleSheets/>
                </div>
                <p className={"text-primary truncate"}>{title}</p>
                <div className={"h-4 w-px border-r border-main"}/>
                <div {...linkTooltip}>
                    <Link size={12}/>
                </div>

            </div>

            <Button className={"hidden group-hover:flex px-1 h-6"}>
                <Trash size={14}/>
            </Button>
        </div>

    )
}



export {BookmarkWidget}