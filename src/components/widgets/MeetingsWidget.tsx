"use client"

import React, {useEffect, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/WidgetHeader"
import {WidgetContent} from "@/components/widgets/WidgetContent"
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {tooltip} from "@/components/ui/TooltipProvider"
import {authClient} from "@/lib/auth-client"
import {Blocks, CalendarPlus, CloudAlert, Filter, RefreshCw, TriangleAlert} from "lucide-react"
import {Callout} from "@/components/ui/Callout"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {format, isSameDay} from "date-fns"
import {Skeleton} from "@/components/ui/Skeleton"
import {DropdownMenu, MenuItem} from "@/components/ui/Dropdown"

interface CalendarEvent {
    id: string
    summary: string
    start: { dateTime: string }
    end: { dateTime: string }
    location: string
}

const MeetingsWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        return (
            <></>
        )
    }

    const { calendars, events, isLoading, isFetching, isError, refetch, googleIntegration, getColor} = useGoogleCalendar()
    const {addToast} = useToast()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc"
    })

    const addEventTooltip = tooltip<HTMLButtonElement>({
        message: "Create a new event",
        anchor: "bc"
    })

    const filterTooltip = tooltip<HTMLButtonElement>({
        message: "Filter your calendars",
        anchor: "bc"
    })

    const dropdownFilterItems: MenuItem[] = Array.from(new Set(calendars.map((cal: any) => ({
        type: "checkbox",
        icon: <div className={"size-3 rounded-sm"} style={{backgroundColor: cal.backgroundColor ?? "white"}}/>,
        key: cal.id,
        label: cal.summary.substring(0, 40),
        //checked: selectedLabels.includes(label),
        //onCheckedChange: () => setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
    }))))

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({provider: "google", callbackURL: "/dashboard"}, {
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
            <WidgetTemplate className="col-span-1 row-span-2" name={"github"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <div className="h-full flex flex-col gap-2 items-center justify-center">
                    <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                        <TriangleAlert size={32}/>
                        If you want to use this widget, you need to integrate your Google account first!
                    </Callout>
                    <Button variant="default" className={"w-max"} onClick={handleIntegrate}>
                        Integrate
                    </Button>
                </div>
            </WidgetTemplate>
        )
    }

    const validEvents = events?.filter(e => e.start.dateTime && e.end.dateTime) || []
    const sortedEvents = [...validEvents].sort((a, b) => {
        return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    })

    const renderEvents = () => {
        if (!sortedEvents.length) {
            return <p className="text-center text-tertiary py-4">No upcoming meetings</p>
        }

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
                        <EventCard event={event} color={getColor(event.id)}/>
                    </React.Fragment>
                )
            }

            return <EventCard key={event.id} event={event} color={getColor(event.id)}/>
        })
    }


    return (
        <WidgetTemplate className={"col-span-1 row-span-1"} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Meetings"} icon={ <GoogleIcon className={"fill-primary size-5"}/>}>
                <Button
                    className={"px-2 group"}
                    disabled={isLoading || isFetching}
                    {...addEventTooltip}
                >
                    <CalendarPlus className="size-4" />
                </Button>
                <DropdownMenu
                    asChild
                    items={dropdownFilterItems}
                    align={"end"}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                >
                    <Button
                        data-state={dropdownOpen ? "open" : "closed"}
                        className={"px-2 group data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                        disabled={calendars.length === 0 || isLoading || isFetching}
                        {...filterTooltip}
                    >
                        <Filter className="size-4" />
                    </Button>
                </DropdownMenu>
                <Button
                    className={"px-2 group"}
                    onClick={() => refetch()}
                    data-loading={(isLoading || isFetching) ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw className="size-4 group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>

            <WidgetContent scroll>
                {(isLoading || isFetching) ? (
                    <div className="flex flex-col justify-between gap-4 pt-2">
                        <Skeleton className={"h-16 w-full px-2"} />
                        <Skeleton className={"h-16 w-full px-2"} />
                        <Skeleton className={"h-16 w-full px-2"} />
                        <Skeleton className={"h-16 w-full px-2"} />
                    </div>
                ) : (
                    <div className={"w-full flex flex-col gap-2 items-center"}>
                        {renderEvents()}
                    </div>
                )}
            </WidgetContent>
        </WidgetTemplate>
    )
}

interface EventProps {
    event: CalendarEvent
    color: string | null
}

const EventCard: React.FC<EventProps> = ({ event, color }) => {
    const convertToRGBA = (color: string, opacity: number): string => {
        if (color.startsWith('rgba')) {
            return color
        }

        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
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

            <div className="relative z-10 text-white">
                <p className="font-medium">{event.summary}</p>
                <p className={"text-secondary"}>{`${format(event.start.dateTime, "HH:mm")} - ${format(event.end.dateTime, "HH:mm")}`}</p>
                <p className={"text-tertiary"}>{event.location}</p>
            </div>
        </div>
    )
}

export {MeetingsWidget}
