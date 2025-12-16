import {useQuery, useQueryClient} from "@tanstack/react-query"
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {authClient} from "@/lib/auth-client"

const GOOGLE_CALENDAR_QUERY_KEY = (accessToken: string | null) => ["googleCalendarList", accessToken] as const
const GOOGLE_EVENT_QUERY_KEY = (accessToken: string | null, calendars: string[]) => ["googleCalendarEvents", accessToken, calendars] as const

async function fetchCalendarList(accessToken: string | null) {
    if (!accessToken) return
    const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {Authorization: `Bearer ${accessToken}`},
    })

    if (!res.ok) throw new Error("Failed to fetch calendar list")

    const data = await res.json()
    return data.items
}

async function fetchCalendarEvents(accessToken: string | null, calendarId: string) {
    if (!accessToken) return

    const baseParams = new URLSearchParams({
        maxResults: "1000",
        orderBy: "updated",
    })

    let events: any[] = []
    let nextPageToken: string | undefined

    do {
        const params = new URLSearchParams(baseParams)
        if (nextPageToken) params.set("pageToken", nextPageToken)

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
            headers: {Authorization: `Bearer ${accessToken}`},
        })

        if (!res.ok) return []

        const data: { items?: any[]; nextPageToken?: string } = await res.json()
        events = [...events, ...(data.items ?? [])]
        if (events.length > 1000) events = events.slice(-1000)
        nextPageToken = data.nextPageToken
    } while (nextPageToken)

    return events
}

export interface CalendarEvent {
    id: string
    summary: string
    start: { dateTime: string }
    end: { dateTime: string }
    location: string
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
                } catch (error) {
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

    const {data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError} = useQuery({
        queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken),
        queryFn: async () => {
            if (!accessToken) return
            const calendarItems = await fetchCalendarList(accessToken)
            return calendarItems ?? []
        },
        enabled: Boolean(accessToken),
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount) => failureCount < 3,
    })

    useEffect(() => {
        if (calendars?.length && selectedCalendars.length === 0) {
            setSelectedCalendars(calendars.map((c: any) => c.id))
        }
    }, [calendars, selectedCalendars])

    const {data: events, isLoading: eventsLoading, isFetching: eventsFetching, isError: eventsError} = useQuery({
        queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars),
        queryFn: async () => {
            if (!accessToken || !calendars) return []
            const selectedCalendarObjects = calendars.filter((cal: any) => selectedCalendars.includes(cal.id))

            const calendarPromises = selectedCalendarObjects.map(async (calendar: any) => {
                const calendarEvents = await fetchCalendarEvents(accessToken, calendar.id)
                return (calendarEvents ?? []).map((event: any) => ({...event, calendarId: calendar.id}))
            })
            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(accessToken) && Boolean(calendars?.length),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: (failureCount) => failureCount < 3,
    })

    const getColor = useCallback((eventId: string) => {
        const event = events?.find((e: { id: string }) => e.id === eventId)
        if (!event?.calendarId) return null
        const calendar = calendars?.find((c: any) => c.id === event.calendarId)
        return calendar?.backgroundColor ?? null
    }, [events, calendars])

    const filteredEvents = useMemo(() => (
        events?.filter((event: { calendarId: string }) => selectedCalendars.includes(event.calendarId)) || []
    ), [events, selectedCalendars])

    const manualRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: GOOGLE_CALENDAR_QUERY_KEY(accessToken) }),
            queryClient.invalidateQueries({ queryKey: GOOGLE_EVENT_QUERY_KEY(accessToken, selectedCalendars) }),
        ])
    }, [queryClient, accessToken, selectedCalendars])

    useEffect(() => {
        if (hasSeenInitialSelection.current) {
            setFilterLoading(true)
        } else {
            hasSeenInitialSelection.current = true
        }
    }, [selectedCalendars])

    useEffect(() => {
        if (!calendarLoading && !eventsLoading && filterLoading) setFilterLoading(false)
    }, [calendarLoading, eventsLoading, filterLoading])

    return {
        calendars,
        events: filteredEvents,
        isLoading: calendarLoading || eventsLoading,
        isFetching: calendarFetching || eventsFetching,
        isError: calendarError || eventsError,
        refetch: manualRefresh,
        googleIntegration,
        getColor,
        selectedCalendars,
        setSelectedCalendars,
        filterLoading
    }
}