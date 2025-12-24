"use client"

import React, {useCallback, useEffect, useState} from "react"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Plus, TimerReset} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {DatePicker} from "@/components/ui/Datepicker"
import {defineWidget, WidgetProps} from "@tryforgeio/sdk"
import {addDays} from "@/lib/utils"
import {EmojiPicker} from "@/components/ui/EmojiPicker"
import {TimePicker} from "@/components/ui/TimePicker"
import {useSettings} from "@/hooks/data/useSettings"
import {useNotifications} from "@/hooks/data/useNotifications"

type Countdown = {
    title: string
    emoji?: string
    date: Date
}

interface CountdownConfig {
    countdown: Countdown | null
}

const formSchema = z.object({
    title: z.string().nonempty({ message: "Title is required" }),
    date: z.date(),
    time: z.string().nonempty({ message: "Time is required" }),
    emoji: z.string(),
}).superRefine((data, ctx) => {
    const [h, m] = data.time.split(":").map(Number)

    const combined = new Date(data.date)
    combined.setHours(h, m ?? 0)

    if (combined <= new Date()) {
        ctx.addIssue({
            path: ["date"],
            message: "Date and time must be in the future",
            code: "custom"
        })
    }
})

const CountdownWidget: React.FC<WidgetProps<CountdownConfig>> = ({widget, config, updateConfig}) => {
    const {settings} = useSettings(widget.userId)
    const {sendReminderNotification} = useNotifications(widget.userId)

    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [now, setNow] = useState(new Date())

    const addTooltip = useTooltip<HTMLButtonElement>({
        message: config.countdown ? "Delete the current countdown" : "Add a new countdown",
        anchor: "tc"
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: addDays(new Date(), 2),
            time: "08:00",
            emoji: "🎉"
        },
    })

    useEffect(() => {
        if (!settings?.config.countdownReminder) return
        if (!config.countdown) return

        const reminderMessage = `Your countdown "${config.countdown.title}" ended!`
        const reminderKey = `countdown-${config.countdown.title}-${config.countdown.date}`

        const targetDate = new Date(config.countdown.date)

        const notify = () => {
            void sendReminderNotification({
                message: reminderMessage,
                type: "reminder",
                key: reminderKey,
            })
        }

        const delay = targetDate.getTime() - Date.now()

        if (delay <= 0) {
            notify()
            return
        }

        const timeout = setTimeout(notify, delay)
        return () => clearTimeout(timeout)
    }, [sendReminderNotification, settings?.config.countdownReminder, config.countdown])

    useEffect(() => {
        if (!config.countdown) return

        const targetDate = new Date(config.countdown.date)

        const tick = () => {
            const current = new Date()

            if (current >= targetDate) {
                setNow(targetDate)
                clearInterval(interval)
                return
            }

            setNow(current)
        }
        const interval = setInterval(tick, 1_000)
        tick()

        return () => clearInterval(interval)
    }, [config.countdown])

    const formatCountdown = useCallback(() => {
        if (!config.countdown) return ""

        const targetDate = new Date(config.countdown.date)
        const diff = targetDate.getTime() - now.getTime()

        if (diff <= 0) {
            return "Ended"
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${days}d ${hours}h ${minutes}m `
    }, [config.countdown, now])

    const handleSave = useCallback(async (updatedCountdown: Countdown | null) => {
        await updateConfig({ countdown: updatedCountdown })
    }, [updateConfig])

    const handleDeleteCountdown = useCallback(async () => await handleSave(null), [handleSave])

    const handleAddCountdown = useCallback(async () => {
        const data = form.getValues()

        const [hours, minutes] = data.time.split(":").map(Number)

        const date = new Date(data.date)
        date.setHours(hours, minutes ?? 0)

        const newCountdown: Countdown = {
            title: data.title,
            emoji: data.emoji,
            date: date
        }

        await updateConfig({ countdown: newCountdown })
        form.reset()
    }, [updateConfig, form])

    return (
        <>
            <WidgetHeader title={config.countdown?.title ?? "Countdown"}>
                {config.countdown ? (
                    <Button
                        variant={"widget"}
                        onClick={handleDeleteCountdown}
                        {...addTooltip}
                    >
                        <TimerReset size={16}/>
                    </Button>
                ) : (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"widget"}
                                className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                                {...addTooltip}
                            >
                                <Plus size={16}/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddCountdown)} className="flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="emoji"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"widget"} className={"size-8 text-2xl"}>
                                                            {field.value}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className={"p-0 z-60"} onWheel={(e) => e.stopPropagation()}>
                                                        <EmojiPicker
                                                            emojisPerRow={6}
                                                            emojiSize={32}
                                                            onEmojiSelect={(value) => {
                                                                field.onChange(value)
                                                                setEmojiPickerOpen(false)
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
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
                                                <FormInput placeholder="Title" {...field} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
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
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date</FormLabel>
                                                <TimePicker
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className={"w-full mt-2"}
                                    >
                                        Add countdown
                                    </Button>

                                </form>
                            </Form>
                        </PopoverContent>
                    </Popover>
                )}

            </WidgetHeader>
            {config.countdown ? (
                <WidgetContent className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                    <div className={"shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-main/40 dark:shadow-md shadow-sm rounded-md w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-6xl md:text-7xl"}>
                        {config.countdown?.emoji}
                    </div>

                    <div className={"flex-1 flex items-center overflow-hidden"}>
                        <p className={"text-2xl md:text-3xl text-primary font-semibold font-mono truncate"}>
                            {formatCountdown()}
                        </p>
                    </div>
                </WidgetContent>

            ) : (
                <WidgetEmpty message={"No countdown configured yet."}/>
            )}
        </>
    )
}

export const countdownWidgetDefinition = defineWidget({
    name: "Countdown",
    component: CountdownWidget,
    description: "See how much time is left to a special event",
    image: "/github_preview.svg",
    tags: [],
    sizes: {
        desktop: { width: 1, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 2 }
    },
    defaultConfig: {
        countdown: null,
    },
})
