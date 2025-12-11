"use client"

import React, {useCallback, useState} from "react"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Plus, Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {addDays} from "date-fns"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {DatePicker} from "@/components/ui/Datepicker"
import {EmojiPicker} from "@ferrucc-io/emoji-picker"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {useWidgets} from "@/hooks/data/useWidgets"
import {useSession} from "@/hooks/data/useSession"
import {defineWidget, WidgetProps } from "@tryforgeio/sdk"

type Countdown = {
    title: string
    emoji?: string
    date: Date
}

interface CountdownConfig {
    countdown: Countdown | null
}

const formSchema = z.object({
    title: z.string().nonempty({message: "Title is required"}),
    date: z.date(),
    emoji: z.string()
})

const CountdownWidget: React.FC<WidgetProps<CountdownConfig>> = ({config, updateConfig}) => {
    const addTooltip = useTooltip<HTMLButtonElement>({
        message: config.countdown ? "Delete the current countdown" : "Add a new countdown",
        anchor: "tc"
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: addDays(new Date(), 2),
            emoji: "🎉"
        },
    })

    const formatCountdown = () => {
        if (!config.countdown) return ""

        const now = new Date()
        const targetDate = new Date(config.countdown.date)
        const diff = targetDate.getTime() - now.getTime()

        if (diff <= 0) {
            return "Countdown has ended"
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${days}d ${hours}h ${minutes}m `
    }

    const handleSave = useCallback(async (updatedCountdown: Countdown | null) => {
        await updateConfig({ countdown: updatedCountdown })
    }, [updateConfig])

    const handleDeleteCountdown = async () => await handleSave(null)

    const handleAddCountdown = async () => {
        const data = form.getValues()

        const newCountdown: Countdown = {
            title: data.title,
            emoji: data.emoji,
            date: data.date
        }

        await updateConfig({ countdown: newCountdown })
        form.reset()
    }

    return (
        <>
            <WidgetHeader title={"Countdown"}>
                {config.countdown ? (
                    <Button
                        variant={"widget"}
                        onClick={handleDeleteCountdown}
                        {...addTooltip}
                    >
                        <Trash size={16}/>
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
                                <form onSubmit={form.handleSubmit(handleAddCountdown)} className="space-y-2">
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
                                    {/*Datepicker & Emojipicker*/}
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
                                        name="emoji"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Emoji</FormLabel>
                                                <EmojiPicker
                                                    emojisPerRow={6}
                                                    emojiSize={40}
                                                    onEmojiSelect={field.onChange}
                                                    className={"border-0 h-full"}
                                                >
                                                    <EmojiPicker.Header className={"shadow-md dark:shadow-xl pb-1"}>
                                                        <EmojiPicker.Input placeholder="Search emoji" hideIcon className={"px-1 bg-secondary border border-main/40"}/>
                                                    </EmojiPicker.Header>
                                                    <EmojiPicker.Group>
                                                        <ScrollArea className={"h-80"} thumbClassname={"bg-white/10"}>
                                                            <EmojiPicker.List containerHeight={12976}/>
                                                        </ScrollArea>
                                                    </EmojiPicker.Group>

                                                </EmojiPicker>
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
                <WidgetContent className="flex flex-row items-center">
                    <div className={"flex items-center justify-center bg-black/5 dark:bg-white/5 size-24 rounded-md text-7xl"}>
                        {config.countdown?.emoji}
                    </div>
                    <div className={"flex flex-col gap-2 "}>
                        <p className={"text-2xl text-secondary font-medium"}>{config.countdown.title}</p>
                        <p className={"text-3xl text-primary font-semibold"}>{formatCountdown()}</p>
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
    preview: {
        description: "See how much time is left to a special event",
        image: "/github_preview.svg",
        tags: [],
        sizes: {
            desktop: { width: 1, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 2 }
        },
    },
    defaultConfig: {
        countdown: null,
    },
})
