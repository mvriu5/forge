"use client"

import React, {useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Plus, Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {tooltip} from "@/components/ui/TooltipProvider"
import {useWidgetStore} from "@/store/widgetStore"
import {useDashboardStore} from "@/store/dashboardStore"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {addDays} from "date-fns"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"

type Countdown = {
    title: string
    emoji?: string
    date: Date
}

const CountdownWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {}

    const {getWidget, refreshWidget} = useWidgetStore()
    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "countdown")
    if (!widget) return

    const [countdown, setCountdown] = useState<Countdown | null>(widget.config?.countdown)

    const addTooltip = tooltip<HTMLButtonElement>({
        message: countdown ? "Delete the current countdown" : "Add a new countdown",
        anchor: "tc"
    })

    const formSchema = z.object({
        title: z.string().nonempty({message: "Title is required"}),
        date: z.date()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: addDays(new Date(), 2)
        },
    })

    const formatCountdown = () => {
        return ""
    }

    const handleDeleteCountdown = () => {

    }

    const handleAddCountdown = () => {

    }

    return (
        <WidgetTemplate id={id} name={"countdown"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                        <PopoverTrigger>
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
                        <div className={"bg-primary p-1 rounded-md text-2xl"}>
                            {countdown?.emoji}
                        </div>
                        <div className={"flex flex-col gap-2 items-center justify-center"}>
                            <p>{countdown.title}</p>
                            <p>{formatCountdown()}</p>
                        </div>
                    </WidgetContent>

                ) : (
                    <WidgetEmpty message={"No countdown configured yet."}/>
                )}


        </WidgetTemplate>
    )
}

export {CountdownWidget}
