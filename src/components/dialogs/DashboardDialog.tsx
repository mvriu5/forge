"use client"

import { Button } from "@/components/ui/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Form, FormField, FormInput, FormItem, FormLabel, FormMessage } from "@/components/ui/Form"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { Dashboard, DashboardInsert } from "@/database"
import { zodResolver } from "@hookform/resolvers/zod"
import { SquarePen } from "lucide-react"
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface DashboardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    showOnClose: boolean
    editMode?: boolean
    dashboards: Dashboard[] | null
    userId?: string
    addDashboard: (input: DashboardInsert) => Promise<Dashboard>
    addDashboardStatus: "idle" | "pending" | "error" | "success"
}

const formSchema = z.object({
    name: z.string()
        .min(3, {message: "Please enter more than 3 characters."})
        .max(12, {message: "Please enter less than 12 characters."})
})

function DashboardDialog({open, onOpenChange, showOnClose, editMode = false, dashboards, userId, addDashboard, addDashboardStatus}: DashboardDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const dashboardTooltip = useTooltip<HTMLButtonElement>({
        message: "Create a new dashboard",
        anchor: "bc",
        offset: 12
    })

    const isDuplicateName = useCallback((name: string) => (dashboards ?? []).some((dashboard) => dashboard.name === name), [dashboards])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!userId) {
            form.setError("name", {type: "validate", message: "You need to be signed in to create a dashboard."})
            return
        }

        if (isDuplicateName(values.name)) {
            form.setError("name", {type: "validate", message: "A dashboard with this name already exists."})
            return
        }

        await addDashboard({
            userId,
            name: values.name,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        })

        toast.success("Successfully created your new dashboard!")
        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => {
                onOpenChange(prev)
                if (!open) form.reset()
            }}
        >
            {showOnClose &&
                <DialogTrigger asChild>
                    <Button
                        className={"hidden lg:flex rounded-l-none border-l-0 px-2"}
                        disabled={!dashboards || dashboards.length === 0 || editMode} {...dashboardTooltip}
                    >
                        <SquarePen size={16} />
                    </Button>
                </DialogTrigger>
            }
            <DialogContent
                className={"md:min-w-75 max-w-[90vw] p-4"}
                onPointerDownOutside={(e) => !showOnClose && e.preventDefault()}
            >
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        Create a new dashboard
                    </DialogTitle>
                    <DialogDescription className={"sr-only"}/>
                    {showOnClose && <DialogClose/>}
                </DialogHeader>

                <div className={"flex flex-col gap-4"}>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col justify-between gap-4 h-full">
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
                                        type={"reset"}
                                        onClick={() => {
                                            onOpenChange(false)
                                            form.reset()
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                }
                                <Button
                                    variant={"brand"}
                                    className={"w-max"}
                                    type={"submit"}
                                    disabled={form.formState.isSubmitting || addDashboardStatus === "pending" || !userId}
                                >
                                    {(form.formState.isSubmitting || addDashboardStatus === "pending") && <Spinner/>}
                                    Create
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DashboardDialog
