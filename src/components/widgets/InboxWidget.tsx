"use client"

import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import { WidgetHeader } from "./base/WidgetHeader"
import { DropdownMenu, MenuItem } from "../ui/Dropdown"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Filter, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useTooltip } from "../ui/TooltipProvider"
import { useSettings } from "@/hooks/data/useSettings"
import { GmailLabel, GmailMessage, useGoogleMail } from "@/hooks/useGoogleMail"
import { WidgetContent } from "./base/WidgetContent"
import { Skeleton } from "../ui/Skeleton"
import { convertToRGBA } from "@/lib/colorConvert"
import { cn } from "@/lib/utils"

const InboxWidget: React.FC<WidgetProps> = ({widget}) => {
    const {settings} = useSettings(widget.userId)
    //notifications
    const {labels, messages, isFetchingMore, isLoading, isError, refetch, getSnippet, selectedLabels, setSelectedLabels} = useGoogleMail()

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const dropdownFilterItems: MenuItem[] = labels
        .filter((label): label is typeof label & { name: string } => !!label.name)
        .map((label) => ({
            type: "checkbox",
            icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: `#${label.color?.backgroundColor ?? "FFFFFF"}`}}/>,
            key: label.id,
            label: label.name,
            checked: selectedLabels.includes(label.name),
            onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label.name) ? prev.filter((name) => name !== label.name) : [...prev, label.name]))
        }))

    //useEffect für notifications

    return (
        <>
            <WidgetHeader title={"Inbox"}>
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
                        disabled={labels.length === 0 || isLoading || isFetchingMore}
                        {...filterTooltip}
                    >
                        <Filter size={16} />
                    </Button>
                </DropdownMenu>
                <Button
                    variant={"widget"}
                    onClick={() => refetch()}
                    data-loading={(isLoading || isFetchingMore) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {(isLoading || isFetchingMore) ? (
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {messages.map((m, index) => (
                            <MessageCard key={`email-${index}-${m.id}`} message={m} labels={labels.filter((l) => m.labelIds?.includes(l.id))} />
                        ))}
                    </div>
                )}
            </WidgetContent>
        </>
    )
}

const MessageCard = ({ message, labels }: { message: GmailMessage, labels: GmailLabel[] }) => {
    const senderSplit: string[] = message.payload.headers.filter((h: any) => h.name === "From")[0].value.split('<')
    const senderTitle: string = senderSplit[0]
    const senderMail: string = senderSplit[1]?.replace(/[<>]/g, "")

    const transformedLabels = (labels ?? []).map((label) => {
        let name = (label.name ?? "").toString()

        if (name.startsWith("CATEGORY_")) name = name.slice("CATEGORY_".length)
        name = name.replace(/_/g, " ").toLowerCase().trim()

        const displayName = name.charAt(0).toUpperCase() + name.slice(1)

        return { ...label, displayName }
    })

    return (
        <div className="flex flex-col p-2 border border-main/40 rounded-md">
            <div className="flex items-center gap-2">
                <p className="text-secondary">{senderTitle}</p>
                <p className="text-tertiary font-mono text-xs">{senderMail}</p>
            </div>
            <p className="text-xs text-primary">
                {message.snippet}
            </p>
            <div className="w-full flex items-center gap-2 mt-2">
                {transformedLabels.map((label, index) => (
                    <div
                        key={`label-${label.id}-${message.id}-${index}`}
                        className={cn(
                            "text-xs font-mono px-2 py-0.5 rounded-md border border-success/20 text-success bg-success/5",
                            label.name === "IMPORTANT" && "bg-error/5 border-error/20 text-error",
                            label.name === "UNREAD" && "bg-brand/5 border-brand/20 text-brand",
                            label.name === "INBOX" && "hidden"
                        )}
                    >
                        {label.displayName}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const inboxWidgetDefinition = defineWidget({
    name: "Inbox",
    integration: "google",
    component: InboxWidget,
    description: "See your received google mails.",
    image: "/github_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    }
})
