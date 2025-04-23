"use client"

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/Dialog"
import React, { useState } from "react"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {CloudAlert, LayoutDashboard, UserRoundCheck} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Button} from "@/components/ui/Button"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {useToast} from "@/components/ui/ToastProvider"
import {useDashboardStore} from "@/store/dashboardStore"
import {useSessionStore} from "@/store/sessionStore"

function DashboardDialog({open, showOnClose}: {open: boolean, showOnClose: boolean}) {
    const {dashboards, addDashboard} = useDashboardStore()
    const {session} = useSessionStore()
    const {addToast} = useToast()

    const [dialogOpen, setDialogOpen] = useState(open)

    const formSchema = z.object({
        name: z.string()
            .min(3, {message: "Please enter more than 3 characters."})
            .refine((name) => !dashboards?.some(d => d.name === name), { message: "A dashboard with this name already exists." })
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!session || !session.user) return

        await addDashboard(session.user.id, {
            userId: session.user.id,
            name: values.name,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        })

        addToast({
            title: "Successfully created a new dashboard!",
            icon: <LayoutDashboard size={24} className={"text-brand"}/>
        })

        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen}>
            <DialogContent className={"md:min-w-[650px] pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-center"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        Create a new dashboard
                    </DialogTitle>
                    {showOnClose && <DialogClose/>}
                </DialogHeader>

                <div className={"flex flex-col gap-4"}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
                            <div className="flex flex-col justify-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormInput placeholder="Name" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className={"w-full flex gap-2 justify-end"}>
                                {showOnClose &&
                                    <Button
                                        className={"w-max"}
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                }
                                <Button
                                    variant={"brand"}
                                    className={"w-max"}
                                    type={"submit"}
                                    disabled={form.formState.isSubmitting}
                                >
                                    {(form.formState.isSubmitting) && <ButtonSpinner/>}
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

export {DashboardDialog}