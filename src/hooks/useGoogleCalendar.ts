import {useIntegrationStore} from "@/store/integrationStore"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {fetchCalendarEvents, fetchCalendarList, refreshToken} from "@/actions/google"
import {useCallback, useEffect, useMemo, useState} from "react"

export const useGoogleCalendar = () => {
    const {googleIntegration, updateIntegration} = useIntegrationStore()
    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
    const queryClient = useQueryClient()

    const isTokenExpired = useMemo(() => {
        if (!googleIntegration?.accessTokenExpiration) return false
        const expirationTime = new Date(googleIntegration.accessTokenExpiration).getTime()
        const currentTime = Date.now()
        const bufferTime = 5 * 60 * 1000
        return expirationTime - currentTime <= bufferTime
    }, [googleIntegration?.accessTokenExpiration])

    const {data: newToken, isLoading: tokenRefreshing, error: tokenError} = useQuery({
        queryKey: ["googleRefreshToken", googleIntegration?.refreshToken],
        queryFn: async () => {
            if (!googleIntegration?.refreshToken) throw new Error("No refresh token available")
            return await refreshToken(googleIntegration.refreshToken)
        },
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

        updateIntegration(googleIntegration.provider ?? "google", googleIntegration.userId!, {
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
        })

        queryClient.invalidateQueries({ queryKey: ["googleCalendarList"] })
        queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] })
    }, [newToken])

    const currentAccessToken = useMemo(() => {
        return newToken?.access_token || googleIntegration?.accessToken
    }, [newToken?.access_token, googleIntegration?.accessToken])

    const {data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError} = useQuery({
        queryKey: ["googleCalendarList", currentAccessToken],
        queryFn: async () => {
            if (!currentAccessToken) throw new Error("No access token available")
            return await fetchCalendarList(currentAccessToken)
        },
        enabled: Boolean(currentAccessToken) && !tokenRefreshing,
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
            if (error?.message?.includes("401")) {
                queryClient.invalidateQueries({ queryKey: ["googleRefreshToken"] })
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
        queryKey: ["googleCalendarEvents", currentAccessToken, selectedCalendars],
        queryFn: async () => {
            if (!calendars || calendars.length === 0) return []
            if (!currentAccessToken) throw new Error("No access token available")

            const selectedCalendarObjects = calendars.filter((cal: any) => selectedCalendars.includes(cal.id))

            const calendarPromises = selectedCalendarObjects.map((calendar: any) =>
                fetchCalendarEvents(currentAccessToken, calendar.id),
            )

            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(currentAccessToken) && Boolean(calendars?.length) && !tokenRefreshing,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.message?.includes("401")) {
                queryClient.invalidateQueries({ queryKey: ["googleRefreshToken"] })
                return false
            }
            return failureCount < 3
        },
    })

    const getColor = useCallback((eventId: string) => {
        const event = events?.find(e => e.id === eventId)
        const calendar = calendars?.find((c: any) => c.id === event.creator.email)
        return calendar.backgroundColor ?? null
    }, [events, calendars])

    const filteredEvents = useMemo(() => events?.filter(event => selectedCalendars.includes(event.creator.email)) || [], [events, selectedCalendars])

    const manualRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["googleCalendarList"] }),
            queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] }),
        ])
    }, [queryClient])

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
    }
}