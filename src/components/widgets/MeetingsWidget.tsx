"use client"

import { Button } from "@/components/ui/Button"
import { DropdownMenu, MenuItem } from "@/components/ui/Dropdown"
import { Skeleton } from "@/components/ui/Skeleton"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetEmpty } from "@/components/widgets/base/WidgetEmpty"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useNotifications } from "@/hooks/data/useNotifications"
import { useSettings } from "@/hooks/data/useSettings"
import { authClient } from "@/lib/auth-client"
import { WidgetProps } from "@/lib/definitions"
import { queryOptions } from "@/lib/queryOptions"
import { convertToRGBA, formatDateHeader, formatTime, isSameDay } from "@/lib/utils"
import { defineWidget } from "@/lib/widget"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarPlus, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"


const GOOGLE_CALENDAR_QUERY_KEY = (accessToken: string | null) => ["googleCalendarList", accessToken] as const
const GOOGLE_EVENT_QUERY_KEY = (accessToken: string | null, calendars: string[]) => ["googleCalendarEvents", accessToken, calendars] as const

export interface GoogleCalendar {
    id: string
    summary: string
    accessRole: string
    backgroundColor?: string
    primary?: boolean
}

export interface CalendarEvent {
    id: string
    summary: string
    start: { dateTime?: string; date?: string }
    end: { dateTime?: string; date?: string }
    recurrence?: string[]
    recurringEventId?: string
    location?: string
    hangoutLink?: string
    calendarId?: string
    conferenceData?: {
        createRequest?: {
            requestId?: string
            conferenceSolutionKey?: { type?: string }
        }
    }
}

interface CalendarListResponse {
    items?: GoogleCalendar[]
    nextPageToken?: string
}

interface EventsListResponse {
    items?: CalendarEvent[]
    nextPageToken?: string
}

async function fetchCalendarList(accessToken: string | null): Promise<GoogleCalendar[]> {
    if (!accessToken) return []

    const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) throw new Error("Failed to fetch calendar list")

    const data: CalendarListResponse = await res.json()
    return data.items ?? []
}

async function fetchEventInstances(accessToken: string | null, calendarId: string, eventId: string, timeMin: string): Promise<CalendarEvent[]> {
    if (!accessToken) return []

    let events: CalendarEvent[] = []
    let nextPageToken: string | undefined

    do {
        const params = new URLSearchParams({
            maxResults: "1000",
            timeMin,
        })

        if (nextPageToken) params.set("pageToken", nextPageToken)

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}/instances?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) return []

        const data: EventsListResponse = await res.json()
        events = [...events, ...(data.items ?? [])]
        if (events.length > 1000) events = events.slice(-1000)
        nextPageToken = data.nextPageToken
    } while (nextPageToken)

    return events
}

async function fetchCalendarEvents(accessToken: string | null, calendarId: string): Promise<CalendarEvent[]> {
    if (!accessToken) return []

    const baseParams = new URLSearchParams({
        maxResults: "1000",
        orderBy: "updated",
    })

    let events: CalendarEvent[] = []
    let nextPageToken: string | undefined

    do {
        const params = new URLSearchParams(baseParams)
        if (nextPageToken) params.set("pageToken", nextPageToken)

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) return []

        const data: EventsListResponse = await res.json()
        events = [...events, ...(data.items ?? [])]
        if (events.length > 1000) events = events.slice(-1000)
        nextPageToken = data.nextPageToken
    } while (nextPageToken)

    const recurringEvents = events.filter((event) => (event.recurrence ?? []).length > 0)
    const nonRecurringEvents = events.filter((event) => (event.recurrence ?? []).length === 0)

    const instanceResults = await Promise.all(recurringEvents.map((event) => fetchEventInstances(accessToken, calendarId, event.id, new Date().toISOString())))

    return [...nonRecurringEvents, ...instanceResults.flat()]
}

async function createCalendarEvent(accessToken: string | null, calendarId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!accessToken) throw new Error("Missing access token")

    const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    const requestUrl = new URL(baseUrl)
    if (eventData.conferenceData) {
        requestUrl.searchParams.set("conferenceDataVersion", "1")
    }

    const res = await fetch(requestUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
    })

    if (!res.ok) throw new Error("Failed to create calendar event")

    return res.json()
}

const LazyCreateMeetingDialog = React.lazy(() => import('../dialogs/CreateMeetingDialog').then(module => ({ default: module.CreateMeetingDialog })))

const MeetingsWidget: React.FC<WidgetProps> = ({ widget }) => {
    const { settings } = useSettings(widget.userId)
    const { sendMeetingNotification } = useNotifications(widget.userId)

    const { integrations, refetchIntegrations } = useIntegrations(widget.userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
    const [accessToken, setAccessToken] = useState<string | null>(null)

    const queryClient = useQueryClient()
    const previousUserId = useRef<string | undefined>(undefined)
    const isRefreshingToken = useRef(false)

    useEffect(() => {
        if (!widget.userId) {
            previousUserId.current = undefined
            isRefreshingToken.current = false
            setAccessToken(null)
            return
        }

        const userChanged = previousUserId.current !== widget.userId
        previousUserId.current = widget.userId
        if (userChanged) {
            isRefreshingToken.current = false
        }

        if (!googleIntegration) {
            setAccessToken(null)
            return
        }

        const tokenExpired = googleIntegration.accessTokenExpiration
            ? new Date(googleIntegration.accessTokenExpiration).getTime() <= new Date().getTime()
            : false
        const missingToken = !googleIntegration.accessToken
        const shouldRefreshToken = tokenExpired || missingToken || userChanged

        if (shouldRefreshToken && !isRefreshingToken.current) {
            isRefreshingToken.current = true
            const refreshAccessToken = async () => {
                try {
                    await authClient.refreshToken({
                        providerId: "google",
                        userId: widget.userId,
                    })
                    await refetchIntegrations()
                } catch {
                    setAccessToken(googleIntegration.accessToken ?? null)
                } finally {
                    isRefreshingToken.current = false
                }
            }

            void refreshAccessToken()
            return
        }

        setAccessToken(googleIntegration.accessToken)
    }, [googleIntegration, refetchIntegrations, widget.userId])

    const { data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError, isFetched: calendarsFetched } = useQuery<GoogleCalendar[], Error>(queryOptions({
        queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken),
        queryFn: () => fetchCalendarList(accessToken),
        enabled: Boolean(accessToken)
    }))

    useEffect(() => {
        if (calendars?.length && selectedCalendars.length === 0) {
            setSelectedCalendars(calendars.map((c) => c.id))
        }
    }, [calendars, selectedCalendars.length])

    const { data: eventsData, isLoading: eventsLoading, isFetching: eventsFetching, isError: eventsError, isFetched: eventsFetched } = useQuery<CalendarEvent[], Error>(queryOptions({
        queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars),
        queryFn: async (): Promise<CalendarEvent[]> => {
            if (!accessToken || !calendars) return []

            const selectedCalendarObjects = calendars.filter((cal) => selectedCalendars.includes(cal.id))

            const calendarPromises = selectedCalendarObjects.map(async (calendar) => {
                const calendarEvents = await fetchCalendarEvents(accessToken, calendar.id)
                return calendarEvents.map((event) => ({ ...event, calendarId: calendar.id }))
            })

            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(accessToken) && Boolean(calendars?.length)
    }))

    const events = useMemo(() => (
        eventsData?.filter((event) => event.calendarId && selectedCalendars.includes(event.calendarId)) ?? []
    ), [eventsData, selectedCalendars])

    const createEventMutation = useMutation({
        mutationFn: (variables: { calendarId: string; eventData: Partial<CalendarEvent> }) =>
            createCalendarEvent(accessToken, variables.calendarId, variables.eventData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars) })
        }
    })

    const refetch = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken) }),
            queryClient.invalidateQueries({ queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars) }),
        ])
    }, [queryClient, accessToken, selectedCalendars])

    const isLoading = calendarLoading || eventsLoading;
    const isFetching = calendarFetching || eventsFetching;
    const isReady = calendarsFetched && (calendars?.length ? eventsFetched : true);

    const getColor = useCallback((eventId: string) => {
        const event = events?.find((e) => e.id === eventId)
        if (!event?.calendarId) return null
        const calendar = calendars?.find((c) => c.id === event.calendarId)
        return calendar?.backgroundColor ?? null
    }, [events, calendars])

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const refreshTooltip = useTooltip<HTMLButtonElement>({
        message: "Refresh your events",
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
        const firstDate = new Date(a.start.dateTime || a.start.date || 0).getTime()
        const secondDate = new Date(b.start.dateTime || b.start.date || 0).getTime()

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
                if (Number.isNaN(startTime)) return

                const reminderGraceMs = 60_000
                if (now > startTime + reminderGraceMs) return

                const dueReminders = reminderMinutes
                    .map((minutes: number) => ({
                        minutes,
                        key: `meeting-${event.id}-${minutes}`,
                        reminderTime: startTime - minutes * 60_000,
                    }))
                    .filter(({ reminderTime }: { reminderTime: any }) => reminderTime <= now && now <= reminderTime + reminderGraceMs)

                if (!dueReminders.length) return

                const nearestReminder = dueReminders.reduce((closest: { minutes: number }, current: { minutes: number }) => (
                    current.minutes < closest.minutes ? current : closest
                ))

                const startLabel = formatTime(startTimeString, (settings.config.hourFormat as string) ?? "24")
                const timingLabel = nearestReminder.minutes === 0 ? "now" : `in ${nearestReminder.minutes} minutes`
                const message = `"${event.summary}"${event.hangoutLink ? "meeting" : ""} starts ${timingLabel} (${startLabel})`

                void sendMeetingNotification({
                    message,
                    type: "reminder",
                    url: nearestReminder.minutes === 0 && event.hangoutLink ? event.hangoutLink : "",
                    key: nearestReminder.key,
                })
            })
        }

        const interval = setInterval(checkReminders, 30_000)
        checkReminders()

        return () => clearInterval(interval)
    }, [sortedEvents, settings?.config.meetingReminders, settings?.config.hourFormat, sendMeetingNotification])

    const dropdownFilterItems: MenuItem[] = useMemo(() => Array.from(new Set(calendars?.map((cal: any) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{ backgroundColor: cal.backgroundColor ?? "white" }} />,
        key: cal.id,
        label: cal.summary.substring(0, 40),
        checked: selectedCalendars.includes(cal.id),
        onCheckedChange: () => setSelectedCalendars((prev) => (prev.includes(cal.id) ? prev.filter((l) => l !== cal.id) : [...prev, cal.id]))
    })))), [calendars, selectedCalendars, setSelectedCalendars])

    const renderEvents = useCallback(() => {
        if (!sortedEvents || sortedEvents.length === 0) return

        let currentDate: Date | null = null

        return sortedEvents.map((event) => {
            const eventDate = new Date(event.start.dateTime || event.start.date || 0)
            const showDateHeader = !currentDate || !isSameDay(currentDate, eventDate)

            if (showDateHeader) {
                currentDate = eventDate

                return (
                    <React.Fragment key={event.id}>
                        <p className="w-full text-tertiary text-xs mt-3 mb-1">
                            {formatDateHeader(eventDate)}
                        </p>
                        <EventCard event={event} color={getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"} />
                    </React.Fragment>
                )
            }

            return <EventCard key={event.id} event={event} color={getColor(event.id)} hourFormat={settings?.config.hourFormat ?? "24"} />
        })
    }, [sortedEvents, getColor, settings?.config.hourFormat])

    const hasNoEvents = useMemo(() => {
        return isReady && Array.isArray(events) && events.length === 0 && !isLoading
    }, [calendars, events, isLoading, isReady])

    return (
        <>
            <WidgetHeader title={"Meetings"}>
                <Suspense
                    fallback={
                        <Button variant={"widget"}>
                            <CalendarPlus size={16} />
                        </Button>
                    }
                >
                    <LazyCreateMeetingDialog calendars={calendars} createEvent={createEventMutation.mutate} isLoading={calendarLoading || calendarFetching}/>
                </Suspense>
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
            {!isReady ? (
                <WidgetContent scroll>
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"w-1/2 h-6 px-2"} />
                        <Skeleton className={"h-15 w-full px-2"} />
                        <Skeleton className={"h-15 w-full px-2"} />
                        <Skeleton className={"w-1/3 h-6 px-2"} />
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
            <div className={"absolute left-0 -top-px h-full my-px w-1 rounded-l-xl"} style={{ backgroundColor: color ?? "white" }} />
            <div
                className="absolute inset-0 rounded-md"
                style={{
                    backgroundColor: color ?? "white",
                    opacity: 0.1
                }}
            />

            <div className="relative z-10 text-primary">
                <div className={"flex items-start justify-between gap-2"}>
                    <p className="font-medium">{event.summary}</p>
                    {event.hangoutLink &&
                        <Link
                            href={event.hangoutLink}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                        >
                            <Button
                                variant={"primary"}
                                className={"h-6 text-xs px-2 font-medium shadow-none dark:shadow-none"}
                            >
                                Join Meeting
                            </Button>
                        </Link>
                    }
                </div>
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
    image: "/meetings_preview.svg",
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    }
})
