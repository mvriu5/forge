"use client"

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {Button} from "@/components/ui/Button"
import {Trash} from "lucide-react"
import {Spinner} from "@/components/ui/Spinner"
import React, {useState} from "react"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {toast} from "sonner"
import {useSession} from "@/hooks/data/useSession"
import {useDashboards} from "@/hooks/data/useDashboards"

function DeleteDashboardDialog({dashboardId}: {dashboardId: string}) {
    const {userId} = useSession()
    const {removeDashboard} = useDashboards(userId, null)

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const deleteTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete this dashboard",
        anchor: "bc",
        delay: 800
    })

    const handleDelete = async () => {
        setLoading(true)
        await removeDashboard(dashboardId)
        toast.success("Successfully deleted dashboard!")
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type={"button"}
                    className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error rounded-l-none"}
                    {...deleteTooltip}
                >
                    <Trash size={16}/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"w-[380px] p-4"}>
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        Delete dashboard
                    </DialogTitle>
                    <DialogClose/>
                </DialogHeader>
                <div className={"w-full flex flex-col gap-2 justify-end"}>
                    Are you sure you want to delete this dashboard?

                    <div className={"flex items-center gap-2 justify-end"}>
                        <Button
                            className={"w-max"}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={"error"}
                            className={"w-max"}
                            onClick={handleDelete}
                        >
                            {loading && <Spinner/>}
                            Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDashboardDialog