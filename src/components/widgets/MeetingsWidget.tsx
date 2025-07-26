"use client"

import React, {useCallback, useEffect, useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {tooltip} from "@/components/ui/TooltipProvider"
import {authClient} from "@/lib/auth-client"
import {Blocks, CloudAlert, Filter, RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {format, isSameDay} from "date-fns"
import {Skeleton} from "@/components/ui/Skeleton"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"
import {useSettingsStore} from "@/store/settingsStore"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"

interface CalendarEvent {
    id: string
    summary: string
    start: { dateTime: string }
    end: { dateTime: string }
    location: string
}

const MeetingsWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        const event1: CalendarEvent = {
            id: "evt-001",
            summary: "Team-Meeting",
            start: { dateTime: "2025-05-20T09:00:00+02:00" },
            end: { dateTime: "2025-05-20T10:00:00+02:00" },
            location: "Office"
        }

        const event2: CalendarEvent = {
            id: "evt-002",
            summary: "Customer Discussion",
            start: { dateTime: "2025-05-21T14:30:00+02:00" },
            end: { dateTime: "2025-05-21T15:30:00+02:00" },
            location: "Zoom-Meeting"
        }

        return (
            <WidgetTemplate id={id} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader title={"Meetings"}>
                    <Button className={"h-6 px-2 group border-0 shadow-none dark:shadow-none"}>
                        <Filter className="size-4" />
                    </Button>
                    <Button className={"h-6 px-2 group border-0 shadow-none dark:shadow-none"}>
                        <RefreshCw className="size-4" />
                    </Button>
                </WidgetHeader>

                <WidgetContent scroll>
                    <div className={"w-full flex flex-col gap-2 items-center"}>
                        <p className="w-full text-tertiary text-xs mt-3 mb-1">
                            {`Today, ${format(new Date(), "EEEE, d MMMM")}`}
                        </p>
                        <EventCard event={event1} color={"#ed6631"} hourFormat={"24"}/>
                        <EventCard event={event2} color={"#398e3d"} hourFormat={"24"}/>
                    </div>
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const { calendars, events, isLoading, isFetching, isError, refetch, googleIntegration, getColor, selectedCalendars, setSelectedCalendars, filterLoading} = useGoogleCalendar()
    const {settings} = useSettingsStore()
    const {addToast} = useToast()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc"
    })

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your calendars",
        anchor: "tc"
    })

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
        }, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
                addToast({
                    title: "Successfully integrated Google",
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

    if (!googleIntegration?.accessToken && !isLoading) {
        return (
            <WidgetTemplate id={id} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Google account first!"}
                    actionLabel={"Integrate"}
                    onAction={handleIntegrate}
                />
            </WidgetTemplate>
        )
    }

    const validEvents = useMemo(() => events?.filter(e => e.start.dateTime && e.end.dateTime) || [], [events])

    const sortedEvents = useMemo(() => [...validEvents].sort((a, b) => {
        return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    }), [validEvents])

    const dropdownFilterItems: MenuItem[] = useMemo(() => Array.from(new Set(calendars?.map((cal: any) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: cal.backgroundColor ?? "white"}}/>,
        key: cal.id,
        label: cal.summary.substring(0, 40),
        checked: selectedCalendars.includes(cal.id),
        onCheckedChange: () => setSelectedCalendars((prev) => (prev.includes(cal.id) ? prev.filter((l) => l !== cal.id) : [...prev, cal.id]))
    })))), [calendars, selectedCalendars, setSelectedCalendars])

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
                        <EventCard event={event} color={getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"}/>
                    </React.Fragment>
                )
            }

            return <EventCard key={event.id} event={event} color={getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"}/>
        })
    }, [sortedEvents, getColor, settings?.config.hourFormat])

    const isInitialLoading = useMemo(() => {
        return (
            (isLoading && !calendars) ||
            (isLoading && !events) ||
            (!calendars && !isError) ||
            (calendars && calendars.length > 0 && !events && !isError) ||
            (filterLoading)
        )
    }, [isLoading, calendars, events, isError, filterLoading])

    const hasNoEvents = useMemo(() => {
        return calendars && Array.isArray(events) && events.length === 0 && !isInitialLoading
    }, [calendars, events, isInitialLoading])

    return (
        <WidgetTemplate id={id} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                        className={"h-6 px-2 shadow-none dark:shadow-none group data-[state=open]:bg-inverted/10 data-[state=open]:text-primary border-0"}
                        disabled={!calendars || calendars?.length === 0 || isLoading || isFetching}
                        {...filterTooltip}
                    >
                        <Filter className="size-4" />
                    </Button>
                </DropdownMenu>
                <Button
                    className={"h-6 px-2 group border-0 shadow-none dark:shadow-none"}
                    onClick={refetch}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw className="size-4 group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>

            {isInitialLoading ? (
                <WidgetContent scroll>
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"h-14 w-full px-2"} />
                        <Skeleton className={"h-14 w-full px-2"} />
                        <Skeleton className={"h-14 w-full px-2"} />
                        <Skeleton className={"h-14 w-full px-2"} />
                        <Skeleton className={"h-14 w-full px-2"} />
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
    event: CalendarEvent
    color: string | null
    hourFormat: string
}

const EventCard: React.FC<EventProps> = ({ event, color, hourFormat }) => {
    const convertToRGBA = (color: string, opacity: number): string => {
        if (color.startsWith('rgba')) {
            return color
        }

        if (color.startsWith('#')) {
            const r = Number.parseInt(color.slice(1, 3), 16)
            const g = Number.parseInt(color.slice(3, 5), 16)
            const b = Number.parseInt(color.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${opacity})`
        }

        return `${color.split(')')[0]})`.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
    }

    return (
        <div
            className="p-2 pl-4 w-full flex flex-col gap-2 rounded-md relative"
            style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: convertToRGBA(color ?? "white", 0.2)
            }}
        >
            <div className={"absolute inset-0 h-full w-1 rounded-full"} style={{backgroundColor: color ?? "white"}}/>
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
