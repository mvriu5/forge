import {useQuery, useQueryClient} from "@tanstack/react-query"
import {useCallback, useEffect, useMemo, useState} from "react"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

const GOOGLE_REFRESH_QUERY_KEY = (refreshToken: string | null) => ["googleRefreshToken", refreshToken] as const
const GOOGLE_CALENDAR_QUERY_KEY = (accessToken: string | null) => ["googleCalendarList", accessToken] as const
const GOOGLE_EVENT_QUERY_KEY = (accessToken: string | null, calendars: string[]) => ["googleCalendarEvents", accessToken, calendars] as const

async function fetchCalendarList(accessToken: string) {
    const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {Authorization: `Bearer ${accessToken}`},
    })

    if (!res.ok) throw new Error("Failed to fetch calendar list")

    const data = await res.json()
    return data.items
}

async function fetchCalendarEvents(accessToken: string, calendarId: string) {
    const params = new URLSearchParams({
        maxResults: "1000",
        orderBy: "updated",
    })

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
        headers: {Authorization: `Bearer ${accessToken}`},
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.items
}

async function refreshToken(refreshToken: string | null) {
    if (!refreshToken) return null
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    })

    if (!res.ok) throw new Error("Failed to refresh Google access token")

    const data = await res.json()

    return {
        access_token: data.access_token,
        expires_in: data.expires_in || 3600,
        id_token: data.id_token || null,
    }
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
    const {integrations, updateIntegration} = useIntegrations(userId)
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
    const [filterLoading, setFilterLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const isTokenExpired = useMemo(() => {
        if (!googleIntegration?.accessTokenExpiration) return false
        const expirationTime = new Date(googleIntegration.accessTokenExpiration).getTime()
        const currentTime = Date.now()
        const bufferTime = 5 * 60 * 1000
        return expirationTime - currentTime <= bufferTime
    }, [googleIntegration?.accessTokenExpiration])

    const {data: newToken, isLoading: tokenRefreshing, error: tokenError} = useQuery({
        queryKey: GOOGLE_REFRESH_QUERY_KEY(googleIntegration?.refreshToken ?? null),
        queryFn: () => refreshToken(googleIntegration?.refreshToken ?? null),
        enabled: Boolean(googleIntegration?.refreshToken) && isTokenExpired,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
            if (error?.message?.includes("invalid_grant")) return false
            return failureCount < 3
        }
    })

    useEffect(() => {
        if (!googleIntegration || !newToken) return

        void updateIntegration({
            provider: googleIntegration.provider ?? "google",
            userId: googleIntegration.userId!,
            data: {
                id: googleIntegration.id,
                accountId: googleIntegration.accountId,
                userId: googleIntegration.userId,
                provider: googleIntegration.provider,
                accessToken: newToken.access_token,
                refreshToken: googleIntegration.refreshToken,
                idToken: newToken.id_token,
                accessTokenExpiration: new Date(Date.now() + newToken.expires_in * 1000),
                refreshTokenExpiration: googleIntegration.refreshTokenExpiration,
                createdAt: googleIntegration.createdAt
            }
        })


        void queryClient.invalidateQueries({ queryKey: ["googleCalendarList"] })
        void queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] })
    }, [newToken])

    const currentAccessToken = useMemo(() => {
        return newToken?.access_token || googleIntegration?.accessToken
    }, [newToken?.access_token, googleIntegration?.accessToken])

    const {data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError} = useQuery({
        queryKey: GOOGLE_CALENDAR_QUERY_KEY(currentAccessToken),
        queryFn: () => fetchCalendarList(currentAccessToken),
        enabled: Boolean(currentAccessToken) && !tokenRefreshing,
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
            if (error?.message?.includes("401")) {
                void queryClient.invalidateQueries({ queryKey: ["googleRefreshToken"] })
                return false
            }
            return failureCount < 3
        },
    })

    useEffect(() => {
        if (calendars?.length && selectedCalendars.length === 0) {
            setSelectedCalendars(calendars.map((c: any) => c.id))
        }
    }, [calendars, selectedCalendars])

    const {data: events, isLoading: eventsLoading, isFetching: eventsFetching, isError: eventsError, refetch} = useQuery({
        queryKey: GOOGLE_EVENT_QUERY_KEY(currentAccessToken, selectedCalendars),
        queryFn: async () => {
            const selectedCalendarObjects = calendars.filter((cal: any) => selectedCalendars.includes(cal.id))
            const calendarPromises = selectedCalendarObjects.map(async (calendar: any) => {
                const events = await fetchCalendarEvents(currentAccessToken, calendar.id)
                return events.map((event: any) => ({ ...event, calendarId: calendar.id }))
            })
            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(currentAccessToken) && Boolean(calendars?.length) && !tokenRefreshing,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.message?.includes("401")) {
                void queryClient.invalidateQueries({ queryKey: ["googleRefreshToken"] })
                return false
            }
            return failureCount < 3
        },
    })

    const getColor = useCallback((eventId: string) => {
        const event = events?.find(e => e.id === eventId)
        if (!event?.calendarId) return null
        const calendar = calendars?.find((c: any) => c.id === event.calendarId)
        return calendar?.backgroundColor ?? null
    }, [events, calendars])

    const filteredEvents = useMemo(() => (
        events?.filter(event => selectedCalendars.includes(event.calendarId)) || []
    ), [events, selectedCalendars])

    const manualRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["googleCalendarList"] }),
            queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] }),
        ])
    }, [queryClient])

    useEffect(() => {
        setFilterLoading(true)
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