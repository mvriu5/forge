"use client"

import React, {useEffect, useState} from 'react'
import {WidgetProps, WidgetTemplate} from './base/WidgetTemplate'
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Button} from "@/components/ui/Button"
import {Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus} from "lucide-react"
import {CalendarEvent, useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {cn} from "@/lib/utils"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {format} from 'date-fns'
import {convertToRGBA} from "@/lib/colorConvert"
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {restrictToVerticalAxis, restrictToWindowEdges} from "@dnd-kit/modifiers"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {Popover, PopoverContent, PopoverTrigger} from '../ui/Popover'
import {Calendar} from "@/components/ui/Calendar"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

const CalendarWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {userId} = useSession()
    const {integrations, handleIntegrate} = useIntegrations(userId)
    const googleIntegration = getIntegrationByProvider(integrations, "google")
    const { events: appointments, isLoading, getColor} = useGoogleCalendar()

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - dayOfWeek + 1)
        return monday
    })
    const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null)
    const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            }
        })
    )

    useEffect(() => {
        if (appointments && appointments.length > 0) {
            setEvents(appointments.map((appointment) => ({
                id: appointment.id,
                summary: appointment.summary,
                location: appointment.location,
                start: appointment.start,
                end: appointment.end
            })))
        }
    }, [appointments])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(timer)
    }, [])

    const hours = Array.from({ length: 25 }, (_, i) => i )

    const getWeekDays = () => {
        const days = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart)
            date.setDate(currentWeekStart.getDate() + i)
            days.push(date)
        }
        return days
    }

    const formatDate = (date: Date) => {
        const day = date.getDate()
        const month = months[date.getMonth()]
        const weekday = weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1] // Adjust for Monday start
        return {
            day,
            month,
            weekday,
            dateString: format(date, "yyyy-MM-dd"),
        }
    }

    const getEventsForDate = (dateString: string) => {
        return events.filter((evt) => {
            if (!evt.start || !evt.start.dateTime) return false
            const date = format(evt.start.dateTime, "yyyy-MM-dd")
            if (date === dateString) return true
        })
    }

    const timeToMinutes = (dateString: string) => {
        const date = new Date(dateString)
        const hours = date.getHours()
        const minutes = date.getMinutes()

        return hours * 60 + minutes
    }

    const getCurrentTimePosition = () => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const totalMinutes = hours * 60 + minutes

        if (totalMinutes < 0 || totalMinutes > 1440) return null

        return hours * 60 + (minutes / 60) * 60
    }

    const getAppointmentPosition = (event: CalendarEvent) => {
        const startMinutes = timeToMinutes(event.start.dateTime)
        const endMinutes = timeToMinutes(event.end.dateTime)
        const duration = endMinutes - startMinutes

        const top = ((startMinutes - 360) / 60) * 60
        const height = (duration / 60) * 60

        return { top, height }
    }

    const handleDragStart = (event: any) => {
        const draggedEvent = events.find((evt) => evt.id === event.active.id)
        if (draggedEvent) setActiveDragEvent(draggedEvent)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event

        if (active && over) {
            const draggedEvent = events.find((evt) => evt.id === active.id)
            const targetDateString = String(over.id) // over.id is the dateString of the column

            if (draggedEvent && targetDateString) {
                const initialTop = active.data.current?.initialTop as number // Get initial top from draggable data
                const newTopPixels = initialTop + delta.y

                // Calculate total minutes from 0:00 based on newTopPixels
                const totalMinutesFromStart = (newTopPixels / 60) * 60 // 60px per hour
                const snappedMinutes = Math.round(totalMinutesFromStart / 15) * 15 // Snap to 15-min intervals

                const newStartHour = Math.floor(snappedMinutes / 60)
                const newStartMinutes = snappedMinutes % 60

                // Ensure time is within 0:00 - 23:59 range
                if (newStartHour < 0 || newStartHour > 23) {
                    setActiveDragEvent(null)
                    return // Invalid drop outside calendar hours
                }

                const originalStart = timeToMinutes(draggedEvent.start.dateTime)
                const originalEnd = timeToMinutes(draggedEvent.end.dateTime)
                const duration = originalEnd - originalStart

                const newStartTime = `${newStartHour.toString().padStart(2, "0")}:${newStartMinutes.toString().padStart(2, "0")}`
                const newEndTotalMinutes = newStartHour * 60 + newStartMinutes + duration
                const newEndHour = Math.floor(newEndTotalMinutes / 60)
                const newEndMin = newEndTotalMinutes % 60

                // Ensure end time does not exceed 24:00 (or 23:59)
                if (newEndTotalMinutes > 1440) {
                    setActiveDragEvent(null)
                    return // Termin geht über 24:00 hinaus
                }

                const newEndTime = `${newEndHour.toString().padStart(2, "0")}:${newEndMin.toString().padStart(2, "0")}`

                setEvents((prevEvents) =>
                    prevEvents.map((evt) =>
                        evt.id === draggedEvent.id
                            ? { ...evt, date: targetDateString, startTime: newStartTime, endTime: newEndTime }
                            : evt,
                    ),
                )
            }
        }
        setActiveDragEvent(null)
    }

    const navigateWeek = (direction: "prev" | "next") => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7))
        setCurrentWeekStart(newDate)
    }

    const navigateToWeek = (date: Date) => {
        const dayOfWeek = date.getDay()
        const monday = new Date(date)
        monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
        setCurrentWeekStart(monday)
    }

    const days = getWeekDays()
    const dayIds = days.map((day) => formatDate(day).dateString)
    const today = new Date().toISOString().split("T")[0]
    const currentTimePosition = getCurrentTimePosition()

    const safeDayIds = dayIds.length === 7 ? dayIds : Array(7).fill("")

    const { setNodeRef: setNodeRef0 } = useDroppable({ id: safeDayIds[0] })
    const { setNodeRef: setNodeRef1 } = useDroppable({ id: safeDayIds[1] })
    const { setNodeRef: setNodeRef2 } = useDroppable({ id: safeDayIds[2] })
    const { setNodeRef: setNodeRef3 } = useDroppable({ id: safeDayIds[3] })
    const { setNodeRef: setNodeRef4 } = useDroppable({ id: safeDayIds[4] })
    const { setNodeRef: setNodeRef5 } = useDroppable({ id: safeDayIds[5] })
    const { setNodeRef: setNodeRef6 } = useDroppable({ id: safeDayIds[6] })

    const droppableRefs = [
        setNodeRef0,
        setNodeRef1,
        setNodeRef2,
        setNodeRef3,
        setNodeRef4,
        setNodeRef5,
        setNodeRef6,
    ]

    const hasError = !googleIntegration?.accessToken && !isLoading

    return (
        <WidgetTemplate id={id} widget={widget} name={"calendar"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            {hasError ? (
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Google account first!"}
                    actionLabel={"Integrate"}
                    onAction={() => handleIntegrate("google")}
                />
            ) : (
                <>
                    <WidgetHeader title={"Calendar"}>
                        <Popover open={calendarPopoverOpen} onOpenChange={setCalendarPopoverOpen}>
                            <PopoverTrigger asChild className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary mx-2"}>
                                <Button variant={"widget"}>
                                    <CalendarIcon size={16} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align={"end"} className={"p-0 w-62"}>
                                <Calendar
                                    onDayClick={(date) => {
                                        navigateToWeek(date)
                                        setCalendarPopoverOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="widget" onClick={() => navigateWeek("prev")} className={"-mx-2"}>
                            <ChevronLeft size={16} />
                        </Button>
                        <Button variant="widget" onClick={() => navigateWeek("next")}>
                            <ChevronRight size={16} />
                        </Button>
                        <Button variant={"widget"}>
                            <Plus size={16} />
                        </Button>
                    </WidgetHeader>
                    <WidgetContent className={"border border-main/40 bg-secondary rounded-md gap-0 p-0"}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                        >
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-8 border-b border-main bg-primary rounded-t-md">
                                <div className="filler"/>
                                {days.map((day) => {
                                    const { day: dayNum, weekday, dateString } = formatDate(day)
                                    const isToday = dateString === today

                                    return (
                                        <div key={day.toString()} className={cn("flex items-center justify-center gap-2 py-1 text-center border-l border-main first:border-l-0")}>
                                            <div className="text-sm text-primary font-normal">{weekday}</div>
                                            <div
                                                className={cn(
                                                    "text-sm font-mono",
                                                    isToday
                                                        ? "bg-brand/70 dark:bg-brand text-primary rounded-full size-6 flex items-center justify-center"
                                                        : "text-secondary"
                                                )}
                                            >
                                                {dayNum}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <ScrollArea className={"h-[475px]"}>
                                <div className="relative calendar-drop-zone">
                                    {/* Current time indicator */}
                                    {currentTimePosition !== null && (
                                        <div
                                            className="absolute left-4 right-0 z-20 pointer-events-none"
                                            style={{ top: `${currentTimePosition}px` }}
                                        >
                                            <div className="flex items-center">
                                                <div className="bg-error text-white text-xs px-2 py-1 rounded font-normal mr-2">
                                                    {currentTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                <div className="flex-1 h-0.5 bg-error"/>
                                            </div>
                                        </div>
                                    )}

                                    {hours.map((hour) => (
                                        <div key={hour} className="relative">
                                            <div className="grid grid-cols-8 border-b border-main last:border-b-0 min-h-[60px]">
                                                <div className={cn("-mt-2.5 px-2 text-sm text-secondary font-mono flex items-start justify-end")}>
                                                    {hour.toString().padStart(2, "0")}:00
                                                </div>

                                                {days.map((day, dayIndex) => {
                                                    const { dateString } = formatDate(day)
                                                    const isToday = dateString === today

                                                    const setDroppableRef = droppableRefs[dayIndex]

                                                    return (
                                                        <div
                                                            key={day.toString()}
                                                            ref={setDroppableRef}
                                                            className={`border-l border-main first:border-l-0 relative ${isToday ? "bg-brand/10 dark:bg-brand/5" : ""}`}
                                                        >
                                                            {/* 15-Minuten-Hilfslinien */}
                                                            <div className="absolute inset-0 pointer-events-none">
                                                                <div className="absolute top-[0px] left-0 right-0 h-px bg-main/50 dark:bg-main"/>
                                                            </div>

                                                            {getEventsForDate(dateString).map((evt) => {
                                                                const { height } = getAppointmentPosition(evt)

                                                                const appointmentStartMinutes = timeToMinutes(evt.start.dateTime)
                                                                const appointmentHour = Math.floor(appointmentStartMinutes / 60)
                                                                if (appointmentHour !== hour)  return null

                                                                const minutesInHour = appointmentStartMinutes % 60
                                                                const topPosition = (minutesInHour / 60) * 60

                                                                return (
                                                                    <EventCard
                                                                        key={evt.id}
                                                                        event={evt}
                                                                        topPosition={topPosition}
                                                                        height={height}
                                                                        handleDragStart={handleDragStart}
                                                                        color={getColor(evt.id)}
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DndContext>
                    </WidgetContent>
                </>
            )}
        </WidgetTemplate>
    )
}

interface EventProps {
    event: CalendarEvent
    topPosition: number
    height: number
    handleDragStart: (e: React.DragEvent, appointmentId: string) => void
    color: string | null
}

const EventCard: React.FC<EventProps> = ({event, topPosition, height, color}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: event.id,
        data: { event, initialTop: topPosition },
    })

    const isPast = new Date(event.end.dateTime) < new Date(Date.now())

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "absolute left-2 right-2 rounded-md p-2 text-xs cursor-move hover:shadow-sm," +
                "transition-shadow z-10 overflow-hidden",
                isDragging && "opacity-50"
            )}
            style={{
                top: `${topPosition+2}px`,
                height: `${Math.max(height, 24)-2}px`,
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isPast ? convertToRGBA(color ?? "white", 0.5) : convertToRGBA(color ?? "white", 1),
                backgroundColor: isPast ? convertToRGBA(color ?? "white", 0.2) : convertToRGBA(color ?? "white", 0.5),
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            }}
        >
            <div className={cn("font-medium truncate", isPast ? "text-secondary" : "text-primary")}>{event.summary}</div>
            <p className="text-xs mt-0.5">
                {format(event.start.dateTime, "hh:mm")}–{format(event.end.dateTime, "hh:mm")}
            </p>
            <p className={"text-xs"}>
                {event.location}
            </p>
        </div>
    )
}

export { CalendarWidget }