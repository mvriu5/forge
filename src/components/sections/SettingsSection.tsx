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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {Button} from "@/components/ui/Button"
import React, {Suspense, useMemo} from "react"
import {MultiSelect} from "@/components/ui/MultiSelect"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Switch} from "@/components/ui/Switch"
import {useTheme} from "next-themes"
import {cn} from "@/lib/utils"
import {useTooltip} from "@/components/ui/TooltipProvider"

const TIMEZONES = [
    "UTC",
    "Europe/Berlin",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Asia/Shanghai",
] as const

const formSchema = z.object({
    theme: z.enum(["light", "dark", "system"]),
    hourFormat: z.enum(["12", "24"]),
    timezone: z.enum(TIMEZONES),
    todoReminder: z.boolean(),
    countdownReminder: z.boolean(),
    githubReminder: z.boolean(),
    meetingReminders: z.array(z.enum(["0", "5", "10", "15", "30", "60"])),
    deleteTodos: z.boolean()
})

function SettingsSection({handleClose}: {handleClose: () => void}) {
    const {userId} = useSession()
    const {settings, updateSettings, updateSettingsStatus} = useSettings(userId)
    const {theme, setTheme} = useTheme()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            theme: settings?.config?.theme ?? theme ?? "system",
            hourFormat: settings?.config?.hourFormat ?? "24",
            timezone: settings?.config?.timezone ?? "UTC",
            todoReminder: settings?.config?.todoReminder ?? false,
            countdownReminder: settings?.config?.countdownReminder ?? false,
            githubReminder: settings?.config?.githubReminder ?? false,
            meetingReminders: settings?.config?.meetingReminders ?? [],
            deleteTodos: settings?.config?.deleteTodos ?? false
        }
    })

    const lightTooltip = useTooltip({
        message: "Light Theme",
        anchor: "tc"
    })

    const darkTooltip = useTooltip({
        message: "Dark Theme",
        anchor: "tc"
    })

    const systemTooltip = useTooltip({
        message: "System Theme",
        anchor: "tc"
    })

    const meetingReminderOptions = useMemo(() => ["0", "5", "10", "15", "30", "60"].map((minutes) => ({
        label: `${minutes} minutes before`,
        value: minutes
    })), [])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const newConfig = {
            theme: values.theme,
            hourFormat: values.hourFormat,
            timezone: values.timezone,
            todoReminder: values.todoReminder,
            countdownReminder: values.countdownReminder,
            githubReminder: values.githubReminder,
            meetingReminders: values.meetingReminders,
            deleteTodos: values.deleteTodos
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

        setTheme(values.theme)
        await updateSettings(newSettings)
        toast.success("Successfully updated your settings!")
        handleClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"h-full"}>
                <Suspense fallback={<Spinner/>}>
                    <div className="flex flex-col justify-between gap-4 h-full">
                        <ScrollArea className={"h-full pr-4"}>
                            <div className={"flex flex-col gap-2"}>
                        <p className={"font-mono text-primary"}>General</p>
                        <div className="w-full flex flex-col gap-2 p-2 bg-secondary rounded-md border border-main/40">
                            <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Theme</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Select which theme you prefer to use in the application.
                                            </FormDescription>
                                        </div>
                                        <div className={"flex items-center gap-2"}>
                                            <div
                                                className={cn(
                                                    "shadow-xs dark:shadow-md rounded-lg bg-[#ebebeb] border border-main/40 h-12 w-16 p-1 flex flex-col gap-1",
                                                    field.value === "light" && "ring-2 ring-brand"
                                                )}
                                                onClick={() => field.onChange("light")}
                                                {...lightTooltip}
                                            >
                                                <div className="h-3 w-10 bg-info/30 rounded-md"/>
                                                <div className="h-2 w-12 bg-[#0a0a0a]/10 rounded-md"/>
                                                <div className="h-3 w-8 bg-error/30 rounded-md"/>
                                            </div>
                                            <div
                                                className={cn(
                                                    "shadow-xs dark:shadow-md rounded-lg bg-[#0a0a0a] border border-main/40 h-12 w-16 p-1 flex flex-col gap-1",
                                                    field.value === "dark" && "ring-2 ring-brand"
                                                )}
                                                onClick={() => field.onChange("dark")}
                                                {...darkTooltip}
                                            >
                                                <div className="h-3 w-10 bg-info/10 rounded-md"/>
                                                <div className="h-2 w-12 bg-[#ebebeb]/5 rounded-md"/>
                                                <div className="h-3 w-8 bg-error/10 rounded-md"/>
                                            </div>
                                            <div
                                                className={cn(
                                                    "shadow-xs dark:shadow-md rounded-lg border border-main/40 h-12 w-16 flex",
                                                    field.value === "system" && "ring-2 ring-brand"
                                                )}
                                                onClick={() => field.onChange("system")}
                                                {...systemTooltip}
                                            >
                                                <div className="h-full w-1/2 rounded-l-lg bg-[#ebebeb] p-1 flex flex-col gap-1">
                                                    <div className="h-3 w-10 bg-info/30 rounded-md"/>
                                                    <div className="h-2 w-12 bg-[#0a0a0a]/10 rounded-md"/>
                                                    <div className="h-3 w-8 bg-error/30 rounded-md"/>
                                                </div>
                                                <div className="h-full w-1/2 rounded-r-lg bg-[#0a0a0a] p-1 pl-0 flex flex-col gap-1">
                                                    <div className="h-3 w-3 bg-info/10 rounded-r-md"/>
                                                    <div className="h-2 w-5 bg-[#ebebeb]/5 rounded-r-md"/>
                                                    <div className="h-3 w-1 bg-error/10 rounded-r-md"/>
                                                </div>
                                            </div>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hourFormat"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Hour Format</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Select which hour format you prefer to use in the application.
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-42">
                                                    <SelectValue placeholder="Select hour format" />
                                                </SelectTrigger>
                                                <SelectContent className={"border-main/40"}>
                                                    <SelectItem value={"12"}>12-Hour Clock</SelectItem>
                                                    <SelectItem value={"24"}>24-Hour Clock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Timezone</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Select which timezone you prefer to use in the application.
                                            </FormDescription>
                                        </div>
                                        <div className={"flex flex-col gap-2"}>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-42">
                                                    <SelectValue placeholder="Select timezone" />
                                                </SelectTrigger>
                                                <SelectContent className={"border-main/40"}>
                                                    {TIMEZONES.map((timezone) => (
                                                        <SelectItem key={timezone} value={timezone}>
                                                            {timezone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </div>
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
                            <FormField
                                control={form.control}
                                name="deleteTodos"
                                render={({ field }) => (
                                    <FormItem className={"w-full flex items-center justify-between gap-2"}>
                                        <div className={"w-full flex flex-col justify-center p-0 m-0"}>
                                            <FormLabel className={"text-secondary"}>Auto Delete Todos</FormLabel>
                                            <FormDescription className={"text-tertiary"}>
                                                Do you want todos to be deleted on the end of the day?
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
                        <div className={"w-full flex gap-2 justify-end pr-4"}>
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