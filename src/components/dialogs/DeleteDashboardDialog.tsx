"use client"

import { Button } from "@/components/ui/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { Dashboard } from "@/database"
import { useDashboards } from "@/hooks/data/useDashboards"
import { useSession } from "@/hooks/data/useSession"
import { Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { CopyButton } from "../CopyButton"
import { Input } from "../ui/Input"

interface DeleteDashboardDialogProps {
    dashboard: Dashboard
    onDelete?: () => void
    onAllDeleted?: () => void
}

function DeleteDashboardDialog({dashboard, onDelete, onAllDeleted}: DeleteDashboardDialogProps) {
    const {userId} = useSession()
    const {dashboards, removeDashboard} = useDashboards(userId, null)

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [repeatName, setRepeatName] = useState<string>("")

    const deleteTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete this dashboard",
        anchor: "bc",
        delay: 800
    })

    const validRepatedName = useMemo(() => {
        return repeatName === dashboard.name
    }, [repeatName, dashboard.name])

    const handleDelete = async () => {
        const isLastDashboard = (dashboards?.length ?? 0) <= 1
        if (isLastDashboard) onDelete?.()

        setLoading(true)
        await removeDashboard(dashboard.id)
        if (isLastDashboard) onAllDeleted?.()

        toast.success("Successfully deleted dashboard!")
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type={"button"}
                    className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error"}
                    {...deleteTooltip}
                >
                    <Trash size={16}/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"w-95 p-2 gap-0"}>
                <DialogHeader className={"flex flex-row justify-between items-start m-0"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg"}>
                        Delete dashboard
                    </DialogTitle>
                    <DialogDescription className={"sr-only"}/>
                    <DialogClose/>
                </DialogHeader>
                <div className={"w-full flex flex-col gap-1 justify-end"}>
                    <p className="text-sm">
                        Are you sure you want to delete this dashboard?
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <p>Repeat</p>
                        <div className="flex items-center gap-1 pl-2 bg-tertiary rounded-md shadow-xs dark:shadow-md">
                            <p>{dashboard.name}</p>
                            <CopyButton copyText={dashboard.name} className="size-6 p-0" size={14} strokeWidth={2.5}/>
                        </div>
                        <p>to continue.</p>
                    </div>
                    <Input
                        value={repeatName}
                        onChange={(e) => setRepeatName(e.target.value)}
                        placeholder={"Enter the dashboard name"}
                        className="my-4"
                    />

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
                            disabled={!validRepatedName}
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
