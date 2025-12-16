"use client"

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {CalendarEvent, useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {Filter, RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {Skeleton} from "@/components/ui/Skeleton"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {convertToRGBA} from "@/lib/colorConvert"
import {useSettings} from "@/hooks/data/useSettings"
import {defineWidget, WidgetProps} from "@tryforgeio/sdk"
import {formatDateHeader, formatTime, isSameDay} from "@/lib/utils"
import {useNotifications} from "@/hooks/data/useNotifications"

const MeetingsWidget: React.FC<WidgetProps> = ({widget}) => {
    const {settings} = useSettings(widget.userId)
    const {sendMeetingNotification} = useNotifications(widget.userId)
    const {calendars, events, isLoading, isFetching, isError, refetch, getColor, selectedCalendars, setSelectedCalendars, filterLoading} = useGoogleCalendar()

    const sentRemindersRef = useRef<Set<string>>(new Set())

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "tc"
    })

    const filterTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter your calendars",
        anchor: "tc"
    })

    const validEvents = useMemo(() => events?.filter((event) => {
        const start = event.start.dateTime
        const end = event.end.dateTime

        if (!start || !end) return false

        return new Date(start) >= new Date()
    }) || [], [events])

    const sortedEvents = useMemo(() => [...validEvents].sort((a, b) => {
        const firstDate = new Date(a.start.dateTime ?? a.start.date).getTime()
        const secondDate = new Date(b.start.dateTime ?? b.start.date).getTime()

        return firstDate - secondDate
    }), [validEvents])

    useEffect(() => {
        if (!sortedEvents || !settings?.config.meetingReminders?.length) return

        const reminderMinutes = settings.config.meetingReminders
            .map((value: any) => Number(value))
            .filter((value: unknown) => !Number.isNaN(value))
            .sort((a: number, b: number) => a - b)

        if (!reminderMinutes.length) return

        const checkReminders = () => {
            const now = Date.now()

            sortedEvents.forEach((event) => {
                const startTimeString = event.start.dateTime ?? event.start.date
                if (!event.start.dateTime || !startTimeString) return

                const startTime = new Date(startTimeString).getTime()
                if (Number.isNaN(startTime) || startTime <= now) return

                const dueReminders = reminderMinutes
                    .map((minutes: number) => ({
                        minutes,
                        key: `${event.id}-${minutes}`,
                        reminderTime: startTime - minutes * 60_000,
                    }))
                    .filter(({key, reminderTime}: {key: any, reminderTime: any}) => reminderTime <= now && !sentRemindersRef.current.has(key))

                if (!dueReminders.length) return

                const nearestReminder = dueReminders.reduce((closest: { minutes: number }, current: { minutes: number }) => (
                    current.minutes < closest.minutes ? current : closest
                ))

                dueReminders.map(({key}: {key: any}) => sentRemindersRef.current.add(key))

                const startLabel = formatTime(startTimeString, settings.config.hourFormat ?? "24")
                const timingLabel = nearestReminder.minutes === 0
                    ? "now"
                    : `in ${nearestReminder.minutes} minutes`
                const message = `${event.summary ?? "Meeting"} starts ${timingLabel} (${startLabel})`

                void sendMeetingNotification({
                    message,
                    type: "reminder",
                    url: nearestReminder.minutes === 0 ? event.hangoutLink : null,
                }).catch(() => {
                    dueReminders.map(({key}: {key: any}) => sentRemindersRef.current.delete(key))
                })
            })
        }

        const interval = setInterval(checkReminders, 30_000)
        checkReminders()

        return () => clearInterval(interval)
    }, [sortedEvents, settings?.config.meetingReminders, settings?.config.hourFormat, sendMeetingNotification])

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
                            {formatDateHeader(eventDate)}
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
        <>
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
                        disabled={!calendars || calendars?.length === 0 || isLoading || isFetching}
                        {...filterTooltip}
                    >
                        <Filter size={16} />
                    </Button>
                </DropdownMenu>
                <Button
                    className={"group"}
                    variant={"widget"}
                    onClick={refetch}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw size={16} className="group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>
            {isLoading ? (
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
        </>
    )
}

interface EventProps {
    event: CalendarEvent
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
                <p className={"text-secondary"}>{`${formatTime(event.start.dateTime, hourFormat)} - ${formatTime(event.end.dateTime, hourFormat)}`}</p>
                <p className={"text-tertiary"}>{event.location}</p>
            </div>
        </div>
    )
}

export const meetingsWidgetDefinition = defineWidget({
    name: "Meetings",
    integration: "google",
    component: MeetingsWidget,
    description: 'Overview of your next meetings',
    image: "/github_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2},
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 1 }
    }
})
