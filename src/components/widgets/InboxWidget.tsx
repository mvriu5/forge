"use client"

import { useNotifications } from "@/hooks/data/useNotifications"
import { useSettings } from "@/hooks/data/useSettings"
import { getHeaderValue, useGoogleMail } from "@/hooks/useGoogleMail"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import { Filter, RefreshCw } from "lucide-react"
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../ui/Button"
import { DropdownMenu, MenuItem } from "../ui/Dropdown"
import { Skeleton } from "../ui/Skeleton"
import { Spinner } from "../ui/Spinner"
import { useTooltip } from "../ui/TooltipProvider"
import { WidgetContent } from "./base/WidgetContent"
import { WidgetHeader } from "./base/WidgetHeader"

const LazyInboxDialog = React.lazy(() => import("../../components/dialogs/InboxDialog").then(mod => ({ default: mod.InboxDialog })))

const InboxWidget: React.FC<WidgetProps> = ({widget}) => {
    const {settings} = useSettings(widget.userId)
    const {sendMailNotification} = useNotifications(widget.userId)
    const {labels, messages, isFetchingMore, isLoading, refetch, selectedLabels, setSelectedLabels, hasMore, loadMore, filterLoading} = useGoogleMail()

    const [openMailId, setOpenMailId] = useState<string | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const latestSeenIdRef = useRef<string | null>(null)
    const hasInitializedRef = useRef(false)
    const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your issues",
        anchor: "tc",
    })

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc",
    })

    const transformedLabels = useMemo(() => (labels ?? []).map((label) => {
        let name = (label.name ?? "").toString()

        if (name.startsWith("CATEGORY_")) name = name.slice("CATEGORY_".length)
        name = name.replace(/_/g, " ").toLowerCase().trim()

        const displayName = name.charAt(0).toUpperCase() + name.slice(1)

        return { ...label, displayName }
    }), [labels])

    const dropdownFilterItems: MenuItem[] = transformedLabels
        .filter((label): label is typeof label & { name: string } => !!label.name)
        .map((label) => ({
            type: "checkbox",
            key: label.id,
            label: label.displayName,
            checked: selectedLabels.includes(label.id),
            onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label.id) ? prev.filter((id) => id !== label.id) : [...prev, label.id]))
        }))

    useEffect(() => {
        if (!settings?.config.mailReminder) return
        if (!messages || messages.length === 0) return

        const newest = messages[0]

        if (!hasInitializedRef.current) {
            latestSeenIdRef.current = newest.id
            hasInitializedRef.current = true
            return
        }

        if (latestSeenIdRef.current !== newest.id) {
            latestSeenIdRef.current = newest.id

            void sendMailNotification?.({
                type: "reminder",
                id: newest.id,
                message: getHeaderValue(newest, "Subject") ?? "(No subject)",
                snippet: newest.snippet ?? "",
                key: `mail-${newest.id}`
            })
        }
    }, [messages, settings?.config.mailReminder, sendMailNotification])

    useEffect(() => {
        if (!loadMoreTriggerRef.current) return
        const el = loadMoreTriggerRef.current
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && hasMore && !isFetchingMore) {
                    void loadMore()
                }
            })
        }, { root: null, rootMargin: "200px", threshold: 0.1 })

        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, loadMore])

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
                        disabled={labels.length === 0 || isLoading || isFetchingMore || isRefreshing || filterLoading}
                        {...filterTooltip}
                    >
                        <Filter size={16} />
                    </Button>
                </DropdownMenu>
                <Button
                    variant={"widget"}
                    onClick={() => {
                        void (async () => {
                            setIsRefreshing(true)
                            await refetch()
                            setIsRefreshing(false)
                        })()
                    }}
                    data-loading={(isLoading || isFetchingMore || isRefreshing || filterLoading) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            <WidgetContent scroll>
                {(messages.length === 0 && (isLoading || isFetchingMore || filterLoading || isRefreshing)) ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                        <Skeleton className={"h-17 w-full px-2"} />
                    </div>
                ) : (
                    <div className={"flex flex-col gap-2"}>
                        {messages.map((m, index) => (
                            <Suspense fallback={<Skeleton className={"h-17 w-full px-2"} />}  key={`email-${index}-${m.id}`}>
                                <LazyInboxDialog
                                    message={m}
                                    labels={labels.filter((l) => m.labelIds?.includes(l.id))}
                                    open={openMailId === m.id}
                                    onOpenChange={(isOpen) => setOpenMailId(isOpen ? m.id : null)}
                                />
                            </Suspense>
                        ))}

                        <div className="flex flex-col items-center mt-2">
                            {hasMore ? (
                                <Button
                                    variant={"widget"}
                                    onClick={() => void loadMore()}
                                    disabled={isFetchingMore}
                                >
                                    {isFetchingMore && <Spinner/>}
                                    {isFetchingMore ? "Loading" : "Load more"}
                                </Button>
                            ) : (
                                <div className="text-sm">No more messages</div>
                            )}
                        </div>
                        <div ref={loadMoreTriggerRef} />
                    </div>
                )}
            </WidgetContent>
        </>
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
