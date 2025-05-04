"use client"

import React, { useEffect } from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/WidgetHeader"
import {WidgetContent} from "@/components/widgets/WidgetContent"
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {tooltip} from "@/components/ui/TooltipProvider"
import {authClient} from "@/lib/auth-client"
import {Blocks, CloudAlert, RefreshCw, TriangleAlert} from "lucide-react"
import {Callout} from "@/components/ui/Callout"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {format, isFuture, parseISO} from "date-fns"

interface CalendarEvent {
    id: string
    summary: string
    start: { dateTime: string }
    end: { dateTime: string }
}

const MeetingsWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        return (
            <></>
        )
    }

    const { calendars, events, isLoading, isFetching, isError, refetch, googleIntegration, getColor} = useGoogleCalendar()
    const {addToast} = useToast()

    useEffect(() => {
        console.log(events)
    }, [events])

    const refreshTooltip = tooltip<HTMLButtonElement>({
        message: "Refresh your issues & pull requests",
        anchor: "bc",
    })

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

    return (
        <WidgetTemplate className={"flex flex-col gap-4 col-span-1 row-span-1 overflow-hidden"} name={"meetings"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Meetings"} icon={ <GoogleIcon className={"fill-primary size-5"}/>}>
                <Button
                    className={"px-2 group"}
                    onClick={() => refetch()}
                    data-loading={isLoading ? "true" : "false"}
                    {...refreshTooltip}
                >
                    <RefreshCw className="h-4 w-4 group-data-[loading=true]:animate-spin" />
                </Button>
            </WidgetHeader>

            <WidgetContent scroll>
                <div className={"w-full flex flex-col gap-2 items-center"}>
                    {events?.filter(e => e.start.dateTime && e.end.dateTime).map(event => (
                        <EventCard key={event?.id} event={event} color={getColor(event.id)}/>
                    ))}
                </div>
            </WidgetContent>
        </WidgetTemplate>
    )
}

interface EventProps {
    event: CalendarEvent
    color: string | null
}

const EventCard: React.FC<EventProps> = ({ event, color }) => {
    return (
        <div
            className={"p-2 w-full flex flex-col gap-2 bg-primary rounded-md text-white"}
            style={{backgroundColor: color ?? "white", borderColor: color ?? "white"}}
        >
            <p>{event.summary}</p>
            <p>{`${format(event.start.dateTime, "HH:mm")} - ${format(event.end.dateTime, "HH:mm")}`}</p>
        </div>
    )
}

export {MeetingsWidget}
