"use client"

import {useSession} from "@/hooks/data/useSession"
import {useSettings} from "@/hooks/data/useSettings"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Settings} from "@/database"
import {toast} from "sonner"
import {Form, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Spinner} from "@/components/ui/Spinner"
import {RadioGroup} from "@/components/ui/RadioGroup"
import {RadioGroupBox} from "@/components/ui/RadioGroupBox"
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
                <Suspense fallback={<Spinner/>}>
                    <div className="w-full flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="hourFormat"
                            render={({ field }) => (
                                <FormItem className={"w-full"}>
                                    <FormLabel>Hour format</FormLabel>
                                    <RadioGroup
                                        {...field}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid-cols-2 "
                                    >
                                        <RadioGroupBox
                                            title={"12h"}
                                            value={"12"}
                                            id={"12h-format"}
                                            compareField={field.value}
                                        />
                                        <RadioGroupBox
                                            title={"24h"}
                                            value={"24"}
                                            id={"24h-format"}
                                            compareField={field.value}
                                        />
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                </Suspense>
            </form>
        </Form>
    )
}

export {SettingsSection}