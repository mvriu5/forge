"use client"

import React, {useCallback, useMemo, useState} from "react"
import {Filter, RefreshCw} from "lucide-react"
import {format, isSameDay} from "date-fns"
import { WidgetProps, WidgetTemplate } from "../base/WidgetTemplate"
import { tooltip } from "@forge/ui/components/TooltipProvider"
import { WidgetError } from "../base/WidgetError"
import {DropdownMenu, MenuItem } from "@forge/ui/components/Dropdown"
import {Settings} from "../../types"
import { WidgetHeader } from "../base/WidgetHeader"
import { Button } from "@forge/ui/components/Button"
import { WidgetContent } from "../base/WidgetContent"
import { Skeleton } from "@forge/ui/components/Skeleton"
import { WidgetEmpty } from "../base/WidgetEmpty"
import {convertToRGBA} from "@forge/ui/lib/utils"

type GoogleHookReturn = {
    calendars: any[] | null
    events: any[] | null
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    refetch: () => void
    googleIntegration: any
    getColor: (eventId: string) => string | null
    selectedCalendars: string[]
    setSelectedCalendars: React.Dispatch<React.SetStateAction<string[]>>
    filterLoading: boolean
}

interface MeetingWidgetProps extends WidgetProps {
    onIntegrate: () => void
    hook: GoogleHookReturn
    settings: Settings
}

const MeetingsWidget: React.FC<MeetingWidgetProps> = ({widget, editMode, onWidgetDelete, onIntegrate, hook, settings}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc"
    })

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your calendars",
        anchor: "tc"
    })

    if (!hook.googleIntegration?.accessToken && !hook.isLoading) {
        return (
            <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Google account first!"}
                    actionLabel={"Integrate"}
                    onAction={onIntegrate}
                />
            </WidgetTemplate>
        )
    }

    const validEvents = useMemo(() => hook.events?.filter(e => e.start.dateTime && e.end.dateTime && new Date(e.start.dateTime) >= new Date(Date.now())) || [], [hook.events])

    const sortedEvents = useMemo(() => [...validEvents].sort((a, b) => {
        return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    }), [validEvents])

    const dropdownFilterItems: MenuItem[] = useMemo(() => Array.from(new Set(hook.calendars?.map((cal: any) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: cal.backgroundColor ?? "white"}}/>,
        key: cal.id,
        label: cal.summary.substring(0, 40),
        checked: hook.selectedCalendars.includes(cal.id),
        onCheckedChange: () => hook.setSelectedCalendars((prev) => (prev.includes(cal.id) ? prev.filter((l) => l !== cal.id) : [...prev, cal.id]))
    })))), [hook.calendars, hook.selectedCalendars, hook.setSelectedCalendars])

    const renderEvents = useCallback(() => {
        if (!sortedEvents || sortedEvents.length === 0) return

        let currentDate: Date | null = null

        return sortedEvents.map((event) => {
            const eventDate = new Date(event.start.dateTime)
            const showDateHeader = !currentDate || !isSameDay(currentDate, eventDate)

            if (showDateHeader) {
                currentDate = eventDate

                return (
                    <React.Fragment key={event.id}>
                        <p className="w-full text-tertiary text-xs mt-3 mb-1">
                            {format(eventDate, "EEEE, d MMMM")}
                        </p>
                        <EventCard event={event} color={hook.getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"}/>
                    </React.Fragment>
                )
            }

            return <EventCard key={event.id} event={event} color={hook.getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"}/>
        })
    }, [sortedEvents, hook.getColor, settings?.config.hourFormat])

    const isInitialLoading = useMemo(() => {
        return (
            (hook.isLoading && !hook.calendars) ||
            (hook.isLoading && !hook.events) ||
            (!hook.calendars && !hook.isError) ||
            (hook.calendars && hook.calendars.length > 0 && !hook.events && !hook.isError) ||
            (hook.filterLoading)
        )
    }, [hook.isLoading, hook.calendars, hook.events, hook.isError, hook.filterLoading])

    const hasNoEvents = useMemo(() => {
        return hook.calendars && Array.isArray(hook.events) && hook.events.length === 0 && !isInitialLoading
    }, [hook.calendars, hook.events, isInitialLoading])

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Meetings"}>
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
                        className={"group data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                        disabled={!hook.calendars || hook.calendars?.length === 0 || hook.isLoading || hook.isFetching}
                        {...filterTooltip}
                    >
                        <Filter size={16} />
                    </Button>
                </DropdownMenu>
                <Button
                    className={"group"}
                    variant={"widget"}
                    onClick={hook.refetch}
                    data-loading={(hook.isLoading || hook.isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>

            {isInitialLoading ? (
                <WidgetContent scroll>
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"h-15 w-full px-2"} />
                        <Skeleton className={"h-15 w-full px-2"} />
                        <Skeleton className={"h-15 w-full px-2"} />
                        <Skeleton className={"h-15 w-full px-2"} />
                    </div>
                </WidgetContent>
            ) : hasNoEvents ? (
                <WidgetEmpty message={"No upcoming meetings"} />
            ) : (
                <WidgetContent scroll>
                    <div className={"w-full flex flex-col gap-2 items-center"}>{renderEvents()}</div>
                </WidgetContent>
            )}
        </WidgetTemplate>
    )
}

interface EventProps {
    event: any
    color: string | null
    hourFormat: string
}

const EventCard: React.FC<EventProps> = ({ event, color, hourFormat }) => {
    return (
        <div
            className="p-2 pl-4 w-full flex flex-col gap-2 rounded-md relative"
            style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: convertToRGBA(color ?? "white", 0.2)
            }}
        >
            <div className={"absolute left-0 -top-px h-full my-px w-1 rounded-l-xl"} style={{backgroundColor: color ?? "white"}}/>
            <div
                className="absolute inset-0 rounded-md"
                style={{
                    backgroundColor: color ?? "white",
                    opacity: 0.1
                }}
            />

            <div className="relative z-10 text-primary">
                <p className="font-medium">{event.summary}</p>
                <p className={"text-secondary"}>{`${format(event.start.dateTime, hourFormat === "24" ? "HH:mm" : "h:mm a")} - ${format(event.end.dateTime, hourFormat === "24" ? "HH:mm" : "h:mm a")}`}</p>
                <p className={"text-tertiary"}>{event.location}</p>
            </div>
        </div>
    )
}

export {MeetingsWidget}
