import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {authClient} from "@/lib/auth-client"
import { queryOptions } from "@/lib/queryOptions"
import posthog from "posthog-js"

const GOOGLE_CALENDAR_QUERY_KEY = (accessToken: string | null) => ["googleCalendarList", accessToken] as const
const GOOGLE_EVENT_QUERY_KEY = (accessToken: string | null, calendars: string[]) => ["googleCalendarEvents", accessToken, calendars] as const

interface GoogleCalendar {
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
        headers: {Authorization: `Bearer ${accessToken}`},
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
            headers: {Authorization: `Bearer ${accessToken}`},
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
            headers: {Authorization: `Bearer ${accessToken}`},
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

export const useGoogleCalendar = () => {
    const {userId} = useSession()
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
    const [filterLoading, setFilterLoading] = useState<boolean>(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    const queryClient = useQueryClient()
    const previousUserId = useRef<string | undefined>(undefined)
    const isRefreshingToken = useRef(false)
    const hasSeenInitialSelection = useRef(false)

    useEffect(() => {
        if (!userId) {
            previousUserId.current = undefined
            isRefreshingToken.current = false
            setAccessToken(null)
            return
        }

        const userChanged = previousUserId.current !== userId
        previousUserId.current = userId
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
                        userId,
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
    }, [googleIntegration, refetchIntegrations, userId])

    const {data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError, isFetched: calendarsFetched} = useQuery<GoogleCalendar[], Error>(queryOptions({
        queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken),
        queryFn: () => fetchCalendarList(accessToken),
        enabled: Boolean(accessToken)
    }))

    useEffect(() => {
        if (calendars?.length && selectedCalendars.length === 0) {
            setSelectedCalendars(calendars.map((c) => c.id))
        }
    }, [calendars, selectedCalendars])

    const {data: events, isLoading: eventsLoading, isFetching: eventsFetching, isError: eventsError, isFetched: eventsFetched} = useQuery<CalendarEvent[], Error>(queryOptions({
        queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars),
        queryFn: async (): Promise<CalendarEvent[]> => {
            if (!accessToken || !calendars) return []

            const selectedCalendarObjects = calendars.filter((cal) => selectedCalendars.includes(cal.id))

            const calendarPromises = selectedCalendarObjects.map(async (calendar) => {
                const calendarEvents = await fetchCalendarEvents(accessToken, calendar.id)
                return calendarEvents.map((event) => ({...event, calendarId: calendar.id}))
            })

            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(accessToken) && Boolean(calendars?.length)
    }))

    const getColor = useCallback((eventId: string) => {
        const event = events?.find((e) => e.id === eventId)
        if (!event?.calendarId) return null
        const calendar = calendars?.find((c) => c.id === event.calendarId)
        return calendar?.backgroundColor ?? null
    }, [events, calendars])

    const filteredEvents = useMemo(() => (
        events?.filter((event) => event.calendarId && selectedCalendars.includes(event.calendarId)) ?? []
    ), [events, selectedCalendars])

    const createEventMutation = useMutation({
        mutationFn: (variables: { calendarId: string; eventData: Partial<CalendarEvent> }) =>
            createCalendarEvent(accessToken, variables.calendarId, variables.eventData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars) })
        },
        onError: (error, cal) => posthog.captureException(error, {
            hook: "useGoogleCalendar.createEventMutation", userId, cal
        })
    })

    const manualRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken) }),
            queryClient.invalidateQueries({ queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars) }),
        ])
    }, [queryClient, accessToken, selectedCalendars])

    useEffect(() => {
        if (hasSeenInitialSelection.current) setFilterLoading(true)
        else hasSeenInitialSelection.current = true
    }, [selectedCalendars])

    useEffect(() => {
        if (!calendarLoading && !eventsLoading && filterLoading) setFilterLoading(false)
    }, [calendarLoading, eventsLoading, filterLoading])

    return {
        calendars: calendars ?? [],
        events: filteredEvents,
        isLoading: calendarLoading || eventsLoading,
        isFetching: calendarFetching || eventsFetching,
        isError: calendarError || eventsError,
        isReady: calendarsFetched && (calendars?.length ? eventsFetched : true),
        createEvent: createEventMutation.mutateAsync,
        refetch: manualRefresh,
        googleIntegration,
        getColor,
        selectedCalendars,
        setSelectedCalendars,
        filterLoading
    }
}
