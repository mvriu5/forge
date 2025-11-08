"use client"

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import React from "react"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {LayoutDashboard, SquarePen} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {tooltip} from "@/components/ui/TooltipProvider"
import {Spinner} from "@/components/ui/Spinner"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useSession} from "@/hooks/data/useSession"

interface DashboardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    showOnClose: boolean
    editMode?: boolean
}

function DashboardDialog({open, onOpenChange, showOnClose, editMode}: DashboardDialogProps) {
    const {session} = useSession()
    const userId = session?.user?.id
    const {dashboards, addDashboard, addDashboardStatus} = useDashboards(userId)
    const {addToast} = useToast()

    const formSchema = z.object({
        name: z.string()
            .min(3, {message: "Please enter more than 3 characters."})
            .max(12, {message: "Please enter less than 12 characters."})
            .refine((name) => !(dashboards ?? []).some((d: { name: string }) => d.name === name), { message: "A dashboard with this name already exists." })
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    const dashboardTooltip = tooltip<HTMLButtonElement>({
        message: "Create a new dashboard",
        anchor: "bc",
        offset: 12
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!userId) return

        await addDashboard({
            userId,
            name: values.name,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        })

        addToast({
            title: "Successfully created a new dashboard!",
            icon: <LayoutDashboard size={24} className={"text-brand"}/>
        })

        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                onOpenChange(!open)
                if (!open) form.reset()
            }}
        >
            <DialogTrigger asChild>
                {showOnClose &&
                    <Button className={"hidden lg:flex rounded-l-none border-l-0 px-2"} disabled={!dashboards || dashboards.length === 0 || editMode} {...dashboardTooltip}>
                        <SquarePen size={16} />
                    </Button>
                }
            </DialogTrigger>
            <DialogContent
                className={"md:min-w-[300px] p-4"}
                onPointerDownOutside={(e) => !showOnClose && e.preventDefault()}
            >
                <DialogHeader className={"flex flex-row justify-between items-start"}>
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

export {DashboardDialog}