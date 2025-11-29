"use client"

import React, {useCallback, useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {CalendarEvent, useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {tooltip} from "@/components/ui/TooltipProvider"
import {authClient} from "@/lib/auth-client"
import {Blocks, CloudAlert, Filter, RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {format, isSameDay} from "date-fns"
import {Skeleton} from "@/components/ui/Skeleton"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {convertToRGBA} from "@/lib/colorConvert"
import {useSession} from "@/hooks/data/useSession"
import {useSettings} from "@/hooks/data/useSettings"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

const MeetingsWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {userId} = useSession()
    const {settings} = useSettings(userId)
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const googleIntegration = getIntegrationByProvider(integrations, "google")
    const { calendars, events, isLoading, isFetching, isError, refetch, getColor, selectedCalendars, setSelectedCalendars, filterLoading} = useGoogleCalendar()
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
        const data = await authClient.signIn.social({provider: "google", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
                void refetchIntegrations()
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

    const validEvents = useMemo(() => events?.filter(e => e.start.dateTime && e.end.dateTime && new Date(e.start.dateTime) >= new Date(Date.now())) || [], [events])

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

    const hasError = !googleIntegration?.accessToken && !isLoading

    return (
        <WidgetTemplate id={id} widget={widget} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            {hasError ? (
                    <WidgetError
                        message={"If you want to use this widget, you need to integrate your Google account first!"}
                        actionLabel={"Integrate"}
                        onAction={handleIntegrate}
                    />
                ) : (
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
                    </>
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
