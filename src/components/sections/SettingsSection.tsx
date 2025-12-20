"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AppWindow, Settings as SettingsIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Suspense, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Settings } from "@/database"
import { useSession } from "@/hooks/data/useSession"
import { useSettings } from "@/hooks/data/useSettings"

import { Button } from "@/components/ui/Button"
import { Form, FormField } from "@/components/ui/Form"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { useTooltip } from "@/components/ui/TooltipProvider"

import { ThemeOption } from "@/components/ThemeOption"

import { FieldRow } from "@/components/fields/FieldRow"
import { MultiSelectField } from "@/components/fields/MultiSelectField"
import { SelectField } from "@/components/fields/SelectField"
import { SwitchField } from "@/components/fields/SwitchField"

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
    deleteTodos: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const FIELDS: {
    section: "general" | "widget" | string
    name: keyof FormValues
    type: "select" | "switch" | "multiselect" | "custom"
    label: string
    description?: string
    options?: { label: string; value: string }[]
    className?: string
}[] = [
    {
        section: "general",
        name: "theme",
        type: "custom",
        label: "Theme",
        description: "Select which theme you prefer to use in the application.",
    },
    {
        section: "general",
        name: "hourFormat",
        type: "select",
        label: "Hour Format",
        description: "Select which hour format you prefer to use in the application.",
        options: [
        { label: "12-Hour Clock", value: "12" },
        { label: "24-Hour Clock", value: "24" },
        ],
    },
    {
        section: "general",
        name: "timezone",
        type: "select",
        label: "Timezone",
        description: "Select which timezone you prefer to use in the application.",
        options: TIMEZONES.map((t) => ({ label: t, value: t })),
    },
    {
        section: "widget",
        name: "meetingReminders",
        type: "multiselect",
        label: "Meetings Reminder",
        description: "Do you want a reminder of your next meetings?",
        options: ["0", "5", "10", "15", "30", "60"].map((m) => ({ label: `${m} minutes before`, value: m })),
    },
    {
        section: "widget",
        name: "todoReminder",
        type: "switch",
        label: "Todo Reminder",
        description: "Do you want a reminder of your open todos?",
    },
    {
        section: "widget",
        name: "countdownReminder",
        type: "switch",
        label: "Countdown Reminder",
        description: "Do you want a reminder of when your countdown ends?",
    },
    {
        section: "widget",
        name: "githubReminder",
        type: "switch",
        label: "Github Reminder",
        description: "Do you want a reminder of your open issues & pull requests?",
    },
    {
        section: "widget",
        name: "deleteTodos",
        type: "switch",
        label: "Auto Delete Todos",
        description: "Do you want todos to be deleted at the end of the day?",
    },
]

function SettingsSection({ handleClose }: { handleClose: () => void }) {
    const { userId } = useSession()
    const { settings, updateSettings, updateSettingsStatus } = useSettings(userId)
    const { theme, setTheme } = useTheme()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        theme: (settings?.config?.theme as FormValues["theme"]) ?? (theme as FormValues["theme"]) ?? "system",
        hourFormat: (settings?.config?.hourFormat as FormValues["hourFormat"]) ?? "24",
        timezone: (settings?.config?.timezone as FormValues["timezone"]) ?? "UTC",
        todoReminder: settings?.config?.todoReminder ?? false,
        countdownReminder: settings?.config?.countdownReminder ?? false,
        githubReminder: settings?.config?.githubReminder ?? false,
        meetingReminders: settings?.config?.meetingReminders ?? [],
        deleteTodos: settings?.config?.deleteTodos ?? false,
    }})

    const lightTooltip = useTooltip<HTMLDivElement>({ message: "Light Theme", anchor: "tc" })
    const darkTooltip = useTooltip<HTMLDivElement>({ message: "Dark Theme", anchor: "tc" })
    const systemTooltip = useTooltip<HTMLDivElement>({ message: "System Theme", anchor: "tc" })

    const meetingReminderOptions = useMemo( () => ["0", "5", "10", "15", "30", "60"].map((minutes) => ({
        label: `${minutes} minutes before`,
        value: minutes,
    })), [])

    const onSubmit = async (values: FormValues) => {
        if (!settings) return

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

        const newSettings: Settings = {
            id: settings.id,
            userId: settings.userId,
            lastDashboardId: settings.lastDashboardId,
            onboardingCompleted: settings.onboardingCompleted,
            config: newConfig,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt,
        }

        await updateSettings(newSettings)
        setTheme(values.theme)
        toast.success("Successfully updated your settings!")
        handleClose()
   }

    function renderField(fieldDef: typeof FIELDS[number]) {
        const name = fieldDef.name as string

        if (fieldDef.type === "select") {
            return (
            <SelectField
                    key={name}
                    name={name}
                    label={fieldDef.label}
                    description={fieldDef.description}
                    options={fieldDef.options ?? []}
                    control={form.control}
                    className={fieldDef.className}
            />
            )
        }

        if (fieldDef.type === "switch") {
            return (
                <SwitchField
                    key={name}
                    name={name}
                    label={fieldDef.label}
                    description={fieldDef.description}
                    control={form.control}
                    className={fieldDef.className}
                />
            )
        }

        if (fieldDef.type === "multiselect") {
            return (
                <MultiSelectField
                    key={name}
                    name={name}
                    label={fieldDef.label}
                    description={fieldDef.description}
                    options={fieldDef.options ?? meetingReminderOptions}
                    control={form.control}
                    className={fieldDef.className}
                />
            )
        }

        if (fieldDef.type === "custom") {
            if (fieldDef.name === "theme") {
                return (
                    <FormField
                        key={name}
                        control={form.control}
                        name={name as keyof FormValues}
                        render={({ field }: { field: any }) => (
                            <FieldRow label={fieldDef.label} description={fieldDef.description} className={fieldDef.className}>
                                <div className="flex items-center gap-2">
                                    <ThemeOption variant="light" selected={field.value === "light"} onClick={() => field.onChange("light")} {...lightTooltip} />
                                    <ThemeOption variant="dark" selected={field.value === "dark"} onClick={() => field.onChange("dark")} {...darkTooltip} />
                                    <ThemeOption variant="system" selected={field.value === "system"} onClick={() => field.onChange("system")} {...systemTooltip} />
                                </div>
                            </FieldRow>
                        )}
                    />
                )
            }
        }

        return null
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
                <Suspense fallback={<Spinner />}>
                    <div className="flex flex-col justify-between gap-4 h-full">
                        <ScrollArea className="h-full pr-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <SettingsIcon className="p-1 bg-secondary rounded-md border border-main/40 text-tertiary" />
                                    <p className="font-mono text-primary">General</p>
                                </div>

                                <div className="w-full flex flex-col gap-2 p-2 bg-secondary rounded-md border border-main/40">
                                    {FIELDS.filter((f) => f.section === "general").map(renderField)}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <AppWindow className="p-1 bg-secondary rounded-md border border-main/40 text-tertiary" />
                                    <p className="font-mono text-primary">Widget</p>
                                </div>

                                <div className="w-full flex flex-col gap-2 items-center p-2 bg-secondary rounded-md border border-main/40">
                                {FIELDS.filter((f) => f.section === "widget").map(renderField)}
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="w-full flex gap-2 justify-end pr-4">
                            <Button type="button" className="w-max" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="brand" className="w-max" type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting || updateSettingsStatus === "pending"}>
                                {(form.formState.isSubmitting || updateSettingsStatus === "pending") && <Spinner />}
                                Save
                            </Button>
                        </div>
                    </div>
                </Suspense>
            </form>
        </Form>
    )
}

export { SettingsSection }
