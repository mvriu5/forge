import {useIntegrationStore} from "@/store/integrationStore"
import {useQuery} from "@tanstack/react-query"
import {fetchCalendarEvents, fetchCalendarList} from "@/actions/google"
import {compareAsc, parseISO} from "date-fns"

export const useGoogleCalendar = () => {
    const {googleIntegration} = useIntegrationStore()

    const {data: calendars} = useQuery({
        queryKey: ["googleCalendarList", googleIntegration?.accessToken],
        queryFn: async () => await fetchCalendarList(googleIntegration?.accessToken!),
        enabled: Boolean(googleIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    const {data: events, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: ["googleCalendarEvents", googleIntegration?.accessToken],
        queryFn: async () => {
            if (!calendars || calendars.length === 0) return []

            const calendarPromises = calendars.map((calendar: { id: string; summary: any }) =>
                fetchCalendarEvents(googleIntegration?.accessToken!, calendar.id)
                    .then(events => {
                        const eventsArray = Array.isArray(events) ? events : [];
                        return eventsArray.map((event: any) => ({
                            ...event,
                            calendarId: calendar.id,
                            calendarName: calendar.summary
                        }))
                    })
                    .catch(error => {
                        console.error(`Error fetching events for calendar ${calendar.id}:`, error)
                        return []
                    })
            )

            return await Promise.all(calendarPromises).then((arrayOfEventsArrays) => {
                return arrayOfEventsArrays.flat().sort((a, b) => {
                    const getStartDate = (event: any) => {
                        if (!event.start) return null;
                        return event.start.dateTime
                            ? parseISO(event.start.dateTime)
                            : event.start.date
                                ? parseISO(event.start.date)
                                : typeof event.start === 'string'
                                    ? parseISO(event.start)
                                    : null;
                    }

                    const dateA = getStartDate(a);
                    const dateB = getStartDate(b);

                    if (dateA && dateB) return compareAsc(dateA, dateB)
                    if (dateA) return -1
                    if (dateB) return 1
                    return 0
                })
            })
        },
        enabled: Boolean(googleIntegration?.accessToken) && Boolean(calendars?.length),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    return {
        calendars,
        events,
        isLoading,
        isFetching,
        isError,
        refetch,
        googleIntegration
    }
}