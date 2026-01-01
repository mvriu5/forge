"use client"

import { Button } from "@/components/ui/Button"
import { DatePicker } from "@/components/ui/Datepicker"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Form, FormDescription, FormField, FormInput, FormItem, FormLabel, FormMessage } from "@/components/ui/Form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Spinner } from "@/components/ui/Spinner"
import { Switch } from "@/components/ui/Switch"
import { TimePicker } from "@/components/ui/TimePicker"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarPlus, Info } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    calendarId: z.string(),
    title: z.string()
        .min(3, {message: "Please enter more than 3 characters."})
        .max(12, {message: "Please enter less than 12 characters."}),
    date: z.date(),
    timeStart: z.string().nonempty({ message: "Start is required" }),
    timeEnd: z.string().nonempty({ message: "End is required" }),
    location: z.string().optional().or(z.literal("")),
    createConference: z.boolean()
}).refine((data) => {
    if (!data.timeStart || !data.timeEnd) return true
    const [startHour, startMinute] = data.timeStart.split(":").map(Number)
    const [endHour, endMinute] = data.timeEnd.split(":").map(Number)

    if (endHour < startHour) return false
    return !(endHour === startHour && endMinute <= startMinute)
})

type MeetingFormValues = z.infer<typeof formSchema>

function CreateMeetingDialog() {
    const {calendars, createEvent, isLoading} = useGoogleCalendar()
    const [open, setOpen] = useState(false)

    const addEventTooltip = useTooltip({
        message: "Create a new meeting",
        anchor: "tc"
    })

    const calendarsWithAccess = useMemo(() => calendars?.filter((cal: { accessRole: string }) => cal.accessRole === "owner" || cal.accessRole === "writer"), [calendars])
    const defaultCalendarId = useMemo(() => calendarsWithAccess?.[0]?.id ?? "", [calendarsWithAccess])

    const form = useForm<MeetingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calendarId: calendarsWithAccess?.[0]?.id || "",
            title: "",
            date: new Date(),
            timeStart: "08:00",
            timeEnd: "09:00",
            location: "",
            createConference: false
        }
    })

    useEffect(() => {
        if (calendarsWithAccess?.length) {
            form.setValue("calendarId", calendarsWithAccess[0].id)
        }
    }, [calendarsWithAccess, form])

    const handleAddMeeting: SubmitHandler<MeetingFormValues> = async (data) => {
        const [hoursStart, minutesStart] = data.timeStart.split(":").map(Number)
        const [hoursEnd, minutesEnd] = data.timeEnd.split(":").map(Number)

        const dateStart = new Date(data.date)
        dateStart.setHours(hoursStart, minutesStart)

        const dateEnd = new Date(data.date)
        dateEnd.setHours(hoursEnd, minutesEnd)

        const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`

        const newEvent = {
            summary: data.title,
            start: { dateTime: dateStart.toISOString() },
            end: { dateTime: dateEnd.toISOString() },
            location: data.location,
            ...(data.createConference ? {
                conferenceData: {
                    createRequest: {
                        requestId,
                        conferenceSolutionKey: { type: "hangoutsMeet" }
                    }
                }
            } : {}),
        }

        await createEvent({
            calendarId: data.calendarId,
            eventData: newEvent
        })
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => {
                setOpen(prev)
                if (!prev && defaultCalendarId) {
                    form.reset({ ...form.getValues(), calendarId: defaultCalendarId })
                }
            }}
        >
            <DialogTrigger asChild disabled={isLoading}>
                <Button
                    variant={"widget"}
                    {...addEventTooltip}
                >
                    <CalendarPlus size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-75 p-4"}>
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        New meeting
                    </DialogTitle>
                    <DialogDescription className={"sr-only"}/>
                    <DialogClose/>
                </DialogHeader>
                <div className={"flex flex-col gap-4"}>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleAddMeeting)}
                            className="flex flex-col justify-between gap-4 h-full"
                        >
                            <div className="flex flex-col justify-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="calendarId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calendar</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent className={"border-main/40"}>
                                                    {calendarsWithAccess?.map((cal) => (
                                                        <SelectItem key={cal.id} value={cal.id} className={"px-2"} checkIcon={false}>
                                                            <div className={"flex items-center gap-2"}>
                                                                <div className={"size-3 rounded-sm"} style={{backgroundColor: cal.backgroundColor ?? "white"}}/>
                                                                {cal.summary}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormInput placeholder="Title" {...field}/>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className={"flex items-center justify-between gap-4"}>
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col w-full">
                                                <FormLabel>Date</FormLabel>
                                                <DatePicker
                                                    title={"Pick a date"}
                                                    value={field.value}
                                                    onSelect={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="timeStart"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col w-full">
                                                <FormLabel className={"opacity-0"}>Start</FormLabel>
                                                <TimePicker
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="timeEnd"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col w-full">
                                                <FormLabel className={"opacity-0"}>End</FormLabel>
                                                <TimePicker
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormInput placeholder="eg. Meeting-Room 01" {...field}/>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="createConference"
                                    render={({ field }) => (
                                        <FormItem className={"w-full flex items-center justify-between gap-2 bg-tertiary border border-main/20 rounded-md px-2 py-0.5 shadow-xs dark:shadow-md"}>
                                            <FormDescription className={"flex items-center gap-2 text-tertiary mt-1.5 text-xs"}>
                                                <Info size={14}/>
                                                Do you want to create a Google Meet link for this meeting?
                                            </FormDescription>
                                            <div className={"flex flex-col gap-2"}>
                                                <Switch onCheckedChange={field.onChange} checked={field.value} />
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className={"w-full flex gap-2 justify-end"}>
                                <Button
                                    className={"w-max"}
                                    type={"reset"}
                                    onClick={(prev) => {
                                        setOpen(false)
                                        if (!prev && defaultCalendarId) {
                                            form.reset({ ...form.getValues(), calendarId: defaultCalendarId })
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant={"brand"}
                                    className={"w-max"}
                                    type={"submit"}
                                    disabled={form.formState.isSubmitting}
                                >
                                    {(form.formState.isSubmitting) && <Spinner/>}
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { CreateMeetingDialog }
