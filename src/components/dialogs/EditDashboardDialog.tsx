"use client"

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {Button} from "@/components/ui/Button"
import {Pencil} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Spinner} from "@/components/ui/Spinner"
import React, {useCallback, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Dashboard} from "@/database"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {toast} from "@/components/ui/Toast"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useSession} from "@/hooks/data/useSession"

const formSchema = z.object({
    name: z.string()
        .min(3, {message: "Please enter more than 3 characters."})
        .max(12, {message: "Please enter less than 12 characters."})
})

function EditDashboardDialog({dashboard}: {dashboard: Dashboard}) {
    const {userId} = useSession()
    const {dashboards, updateDashboard} = useDashboards(userId, null)
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: dashboard.name
        }
    })

    const editTooltip = useTooltip<HTMLButtonElement>({
        message: "Edit this dashboard",
        anchor: "bc",
        delay: 800
    })

    const isDuplicateName = useCallback((name: string) => (dashboards ?? []).some((dashboard) => dashboard.name === name), [dashboards])

    const handleUpdate = async (values: z.infer<typeof formSchema>) => {
        if (isDuplicateName(values.name)) {
            form.setError("name", {type: "validate", message: "A dashboard with this name already exists."})
            return
        }

        await updateDashboard({ ...dashboard, name: values.name })
        toast.success("Successfully updated dashboard!")
        setOpen(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                setOpen(!open)
                if (!open) form.reset()
            }}
        >
            <DialogTrigger asChild>
                <Button
                    type={"button"}
                    className={"px-1.5 gap-1.5 text-sm"}
                    {...editTooltip}
                >
                    <Pencil size={14}/>
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-75 p-4"}>
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        Edit dashboard
                    </DialogTitle>
                    <DialogClose/>
                </DialogHeader>
                <div className={"flex flex-col gap-4"}>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleUpdate)}
                            className="flex flex-col justify-between gap-4 h-full"
                        >
                            <div className="flex flex-col justify-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormInput placeholder="Name" {...field}/>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className={"w-full flex gap-2 justify-end"}>
                                <Button
                                    className={"w-max"}
                                    type={"reset"}
                                    onClick={() => {
                                        setOpen(false)
                                        form.reset()
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant={"brand"}
                                    className={"w-max"}
                                    type={"submit"}
                                    disabled={form.formState.isSubmitting || !form.formState.isDirty}
                                >
                                    {(form.formState.isSubmitting) && <Spinner/>}
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

export default EditDashboardDialog
