"use client"

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {CalendarPlus, RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/Button"
import React, {useEffect, useMemo, useState} from "react"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Form, FormDescription, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Spinner} from "@/components/ui/Spinner"
import {DatePicker} from "@/components/ui/Datepicker"
import {TimePicker} from "@/components/ui/TimePicker"
import {useGoogleCalendar} from "@/hooks/useGoogleCalendar"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"

const formSchema = z.object({
    calendarId: z.string(),
    title: z.string()
        .min(3, {message: "Please enter more than 3 characters."})
        .max(12, {message: "Please enter less than 12 characters."}),
    date: z.date(),
    timeStart: z.string().nonempty({ message: "Start is required" }),
    timeEnd: z.string().nonempty({ message: "End is required" }),
    location: z.string().optional().or(z.literal("")),
    link: z.url().optional().or(z.literal("")),
}).refine((data) => {
    if (!data.timeStart || !data.timeEnd) return true
    const [startHour, startMinute] = data.timeStart.split(":").map(Number)
    const [endHour, endMinute] = data.timeEnd.split(":").map(Number)

    if (endHour < startHour) return false
    return !(endHour === startHour && endMinute <= startMinute)
})

function CreateMeetingDialog() {
    const {calendars, createEvent, isLoading} = useGoogleCalendar()
    const [open, setOpen] = useState(false)

    const addEventTooltip = useTooltip({
        message: "Create a new meeting",
        anchor: "tc"
    })

    const calendarsWithAccess = useMemo(() => calendars?.filter((cal: { accessRole: string }) => cal.accessRole === "owner" || cal.accessRole === "writer"), [calendars])
    const defaultCalendarId = useMemo(() => calendarsWithAccess?.[0]?.id ?? "", [calendarsWithAccess])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calendarId: calendarsWithAccess?.[0]?.id || "",
            title: "",
            date: new Date(),
            timeStart: "08:00",
            timeEnd: "09:00",
            location: "",
            link: ""
        }
    })

    useEffect(() => {
        if (calendarsWithAccess?.length) {
            form.setValue("calendarId", calendarsWithAccess[0].id)
        }
    }, [calendarsWithAccess, form])

    const handleAddMeeting = async (data: z.infer<typeof formSchema>) => {
        const [hoursStart, minutesStart] = data.timeStart.split(":").map(Number)
        const [hoursEnd, minutesEnd] = data.timeEnd.split(":").map(Number)

        const dateStart = new Date(data.date)
        dateStart.setHours(hoursStart, minutesStart)

        const dateEnd = new Date(data.date)
        dateEnd.setHours(hoursEnd, minutesEnd)

        const newEvent = {
            summary: data.title,
            start: { dateTime: dateStart.toISOString() },
            end: { dateTime: dateEnd.toISOString() },
            location: data.location,
            hangoutLink: data.link
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
            <DialogContent className={"md:min-w-[300px] p-4"}>
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        New meeting
                    </DialogTitle>
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
                                                    {calendarsWithAccess?.map((cal: { id: string, summary: string, backgroundColor: string }) => (
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
                                                <FormLabel>Start</FormLabel>
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
                                                <FormLabel>End</FormLabel>
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
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meeting Link</FormLabel>
                                            <FormInput placeholder="https://meet.google.com/1234" {...field}/>
                                            <FormMessage />
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

export {CreateMeetingDialog}