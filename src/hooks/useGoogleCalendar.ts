import {useIntegrationStore} from "@/store/integrationStore"
import {useQuery} from "@tanstack/react-query"
import {fetchCalendarEvents, fetchCalendarList} from "@/actions/google"
import {useEffect, useState} from "react"
import {authClient} from "@/lib/auth-client"

export const useGoogleCalendar = () => {
    const {googleIntegration} = useIntegrationStore()
    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])

    const {data: calendars, isLoading: calendarLoading, isFetching: calendarFetching, isError: calendarError} = useQuery({
        queryKey: ["googleCalendarList", googleIntegration?.accessToken],
        queryFn: async () => await fetchCalendarList(googleIntegration?.accessToken!),
        enabled: Boolean(googleIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
    })

    useEffect(() => {
        if (calendars?.length && selectedCalendars.length === 0) {
            setSelectedCalendars(calendars.map((c: any) => c.id))
        }
    }, [calendars, selectedCalendars])

    const {data: events, isLoading: eventsLoading, isFetching: eventsFetching, isError: eventsError, refetch} = useQuery({
        queryKey: ["googleCalendarEvents", googleIntegration?.accessToken],
        queryFn: async () => {
            if (!calendars || calendars.length === 0) return []

            const calendarPromises = calendars.map((calendar: any) => fetchCalendarEvents(googleIntegration?.accessToken!, calendar.id))
            const results = await Promise.all(calendarPromises)
            return results.flat()
        },
        enabled: Boolean(googleIntegration?.accessToken) && Boolean(calendars?.length),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    const getColor = (eventId: string) => {
        const event = events?.find(e => e.id === eventId)
        const calendar = calendars?.find((c: any) => c.id === event.creator.email)
        return calendar.backgroundColor ?? null
    }

    const filteredEvents = events?.filter(event => selectedCalendars.includes(event.creator.email)) || []

    return {
        calendars,
        events: filteredEvents,
        isLoading: calendarLoading || eventsLoading,
        isFetching: calendarFetching || eventsFetching,
        isError: calendarError || eventsError,
        refetch,
        googleIntegration,
        getColor,
        selectedCalendars,
        setSelectedCalendars,
    }
}