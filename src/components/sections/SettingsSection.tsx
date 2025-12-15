"use client"

import {useSession} from "@/hooks/data/useSession"
import {useSettings} from "@/hooks/data/useSettings"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Settings} from "@/database"
import {toast} from "sonner"
import {Form, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Spinner} from "@/components/ui/Spinner"
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/Select"
import {Button} from "@/components/ui/Button"
import React, {Suspense} from "react"

const formSchema = z.object({
    hourFormat: z.enum(["12", "24"])
})

function SettingsSection({handleClose}: {handleClose: () => void}) {
    const {userId} = useSession()
    const {settings, updateSettings, updateSettingsStatus} = useSettings(userId)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hourFormat: settings?.config?.hourFormat ?? "24"
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const newConfig = {
            hourFormat: values.hourFormat
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
                        </div>
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