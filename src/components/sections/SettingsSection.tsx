"use client"

import {useSession} from "@/hooks/data/useSession"
import {useSettings} from "@/hooks/data/useSettings"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Settings} from "@/database"
import {toast} from "@/components/ui/Toast"
import {Form, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Spinner} from "@/components/ui/Spinner"
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/Select"
import {Button} from "@/components/ui/Button"
import React, {Suspense, useMemo} from "react"
import {MultiSelect} from "@/components/ui/MultiSelect"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Switch} from "@/components/ui/Switch"

const formSchema = z.object({
    hourFormat: z.enum(["12", "24"]),
    todoReminder: z.boolean(),
    countdownReminder: z.boolean(),
    githubReminder: z.boolean(),
    meetingReminders: z.array(z.enum(["0", "5", "10", "15", "30", "60"]))
})

function SettingsSection({handleClose}: {handleClose: () => void}) {
    const {userId} = useSession()
    const {settings, updateSettings, updateSettingsStatus} = useSettings(userId)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hourFormat: settings?.config?.hourFormat ?? "24",
            todoReminder: settings?.config?.todoReminder ?? false,
            countdownReminder: settings?.config?.countdownReminder ?? false,
            githubReminder: settings?.config?.githubReminder ?? false,
            meetingReminders: settings?.config?.meetingReminders ?? []
        }
    })

    const meetingReminderOptions = useMemo(() => ["0", "5", "10", "15", "30", "60"].map((minutes) => ({
        label: `${minutes} minutes before`,
        value: minutes
    })), [])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const newConfig = {
            hourFormat: values.hourFormat,
            todoReminder: values.todoReminder,
            countdownReminder: values.countdownReminder,
            githubReminder: values.githubReminder,
            meetingReminders: values.meetingReminders
        }

        if (!settings) return

        const newSettings: Settings = {
            id: settings.id,
            userId: settings.userId,
            lastDashboardId: settings.lastDashboardId,
            config: newConfig,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        }

        await updateSettings(newSettings)
        toast.success("Successfully updated your settings!")
        handleClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"h-full"}>
                <Suspense fallback={<Spinner/>}>
                    <div className="flex flex-col justify-between gap-4 h-full">
                        <ScrollArea className={"h-full"}>
                            <div className={"flex flex-col gap-2"}>
                        <p className={"font-mono text-primary"}>General</p>
                        <div className="w-full flex items-center p-2 bg-secondary rounded-md border border-main/40">
                            <FormField
                                control={form.control}
                                name="hourFormat"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Hour format</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Select which hour format you prefer to use in the application.
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-42">
                                                    <SelectValue placeholder="Select format" />
                                                </SelectTrigger>
                                                <SelectContent className={"border-main/40"}>
                                                    <SelectItem value={"12"}>12 Hour format</SelectItem>
                                                    <SelectItem value={"24"}>24 Hour format</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <p className={"font-mono text-primary mt-2"}>Widget</p>
                        <div className="w-full flex flex-col gap-2 items-center p-2 bg-secondary rounded-md border border-main/40">
                            <FormField
                                control={form.control}
                                name="meetingReminders"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Meetings Reminder</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Do you want a reminder of your next meetings?
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <MultiSelect
                                                options={meetingReminderOptions}
                                                displayValue={`${field.value.length} reminders`}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={"Select reminder times"}
                                            />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="todoReminder"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Todo Reminder</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                               Do you want a reminder of your open todos?
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Switch onCheckedChange={field.onChange} checked={field.value} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="countdownReminder"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Countdown Reminder</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Do you want a reminder of when your countdown ends?
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Switch onCheckedChange={field.onChange} checked={field.value} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="githubReminder"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Github Reminder</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Do you want a reminder of your open issues & pull requests?
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Switch onCheckedChange={field.onChange} checked={field.value} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                        </ScrollArea>
                        <div className={"w-full flex gap-2 justify-end"}>
                            <Button
                                type={"button"}
                                className={"w-max"}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"brand"}
                                className={"w-max"}
                                type={"submit"}
                                disabled={form.formState.isSubmitting || updateSettingsStatus === "pending"}
                            >
                                {(form.formState.isSubmitting || updateSettingsStatus === "pending") && <Spinner/>}
                                Save
                            </Button>
                        </div>
                    </div>
                </Suspense>
            </form>
        </Form>
    )
}

export {SettingsSection}