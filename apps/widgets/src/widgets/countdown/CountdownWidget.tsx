"use client"

import React, {useState} from "react"
import {Plus, Trash} from "lucide-react"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {addDays} from "date-fns"
import {EmojiPicker} from "@ferrucc-io/emoji-picker"
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import {WidgetHeader} from "../base/WidgetHeader"
import { Button } from "@forge/ui/components/Button"
import {Popover, PopoverContent, PopoverTrigger} from "@forge/ui/components/Popover"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@forge/ui/components/Form"
import {DatePicker} from "@forge/ui/components/Datepicker"
import {ScrollArea} from "@forge/ui/components/ScrollArea"
import {WidgetContent} from "../base/WidgetContent"
import {WidgetEmpty} from "../base/WidgetEmpty"

type Countdown = {
    title: string
    emoji?: string
    date: Date
}

interface CountdownWidgetProps extends WidgetProps {
    onUpdateCountdown: (countdown: Countdown | null) => Promise<void>
}

const CountdownWidget: React.FC<CountdownWidgetProps> = ({widget, editMode, onWidgetDelete, onUpdateCountdown}) => {
    const [countdown, setCountdown] = useState<Countdown | null>(widget.config?.countdown ?? null)

    const addTooltip = tooltip<HTMLButtonElement>({
        message: countdown ? "Delete the current countdown" : "Add a new countdown",
        anchor: "tc"
    })

    const formSchema = z.object({
        title: z.string().nonempty({message: "Title is required"}),
        date: z.date(),
        emoji: z.string()
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
        if (!countdown) return ""

        const now = new Date()
        const targetDate = new Date(countdown.date)
        const diff = targetDate.getTime() - now.getTime()

        if (diff <= 0) {
            return "Countdown has ended"
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${days}d ${hours}h ${minutes}m `
    }

    const handleDeleteCountdown = () => {
        setCountdown(null)
        onUpdateCountdown(null)
    }

    const handleAddCountdown = () => {
        const data = form.getValues()

        const newCountdown: Countdown = {
            title: data.title,
            emoji: data.emoji,
            date: data.date
        }

        onUpdateCountdown(newCountdown)
        setCountdown(newCountdown)
        form.reset()
    }

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Countdown"}>
                {countdown ? (
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
                            <Form {...form as any}>
                                <form onSubmit={form.handleSubmit(handleAddCountdown)} className="space-y-2">
                                    <FormField
                                        control={form.control as any}
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
                                        control={form.control as any}
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
                                        control={form.control as any}
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
                {countdown ? (
                    <WidgetContent className="flex flex-row items-center">
                        <div className={"flex items-center justify-center bg-black/5 dark:bg-white/5 size-24 rounded-md text-7xl"}>
                            {countdown?.emoji}
                        </div>
                        <div className={"flex flex-col gap-2 "}>
                            <p className={"text-2xl text-secondary font-medium"}>{countdown.title}</p>
                            <p className={"text-5xl text-primary font-semibold"}>{formatCountdown()}</p>
                        </div>
                    </WidgetContent>

                ) : (
                    <WidgetEmpty message={"No countdown configured yet."}/>
                )}


        </WidgetTemplate>
    )
}

export {CountdownWidget}
