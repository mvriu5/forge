"use client"

import {Button} from "@/components/ui/Button"
import {LayoutTemplate, Save, Undo2} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import React, {useState} from "react"
import DashboardDialog from "@/components/dialogs/DashboardDialog"
import {Skeleton} from "./ui/Skeleton"
import Link from "next/link"
import {Spinner} from "@/components/ui/Spinner"
import {Dashboard, DashboardInsert} from "@/database"

interface HeaderProps {
    editMode: boolean
    editModeLoading?: boolean
    handleEditModeCancel: () => void
    handleEditModeSave: () => void
    onEdit: () => void
    widgetsEmpty: boolean
    isLoading: boolean
    dashboards: Dashboard[] | null
    currentDashboard: Dashboard | null
    onDashboardChange: (dashboardId: string | null) => Promise<void> | void
    addDashboard: (input: DashboardInsert) => Promise<Dashboard>
    addDashboardStatus: "idle" | "pending" | "error" | "success"
    userId?: string
}

function Header({dashboards, currentDashboard, onEdit, editMode, editModeLoading = false, handleEditModeSave, handleEditModeCancel, widgetsEmpty = false, isLoading = false, onDashboardChange, addDashboard, addDashboardStatus, userId}: HeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const layoutTooltip = useTooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        shortcut: "E",
        anchor: "bc",
        offset: 12
    })

    const handleSelectDashboard = async (value: string) => {
        const newDashboard = dashboards?.find(d => d.name === value) ?? null
        if (!newDashboard) return
        await onDashboardChange(newDashboard.id)
    }

    return (
        <div className={"w-full top-0 left-0 h-12 px-4 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main/40"}/>
                {editMode ?
                    <div className={"flex gap-2"}>
                        <Button variant="brand" onClick={handleEditModeSave} className={"h-8 px-2"}>
                            {editModeLoading ? <Spinner/> : <Save size={16} className={"mr-2"}/>}
                            Save
                        </Button>
                        <Button onClick={handleEditModeCancel} className={"size-8 bg-secondary border-main/60"}>
                            <Undo2 size={16}/>
                        </Button>
                    </div>
                    :
                    <div className={"flex gap-2"}>
                        <WidgetDialog editMode={editMode}/>
                        <Button className={"size-8 bg-secondary border-main/60 hidden xl:flex"} {...layoutTooltip} onClick={onEdit} disabled={editMode || widgetsEmpty}>
                            <LayoutTemplate size={16}/>
                        </Button>
                        <div className={"flex"}>
                            <Select
                                value={currentDashboard?.name ?? ""}
                                onValueChange={handleSelectDashboard}
                                disabled={dashboards?.length === 0 || editMode}
                            >
                                <SelectTrigger className={"max-w-[280px] bg-primary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary flex lg:rounded-r-none gap-0.5"} disabled={editMode}>
                                    <div className={"w-full flex items-center gap-1 overflow-hidden text-xs"}>
                                        <p className={"text-tertiary text-xs font-mono"}>Dashboard:</p>
                                        {isLoading ?
                                            <Skeleton className={"w-10 h-4"}/> :
                                            <SelectValue className={" truncate"}/>
                                        }
                                    </div>
                                </SelectTrigger>
                                <SelectContent align={"end"} className={"border-main/40"}>
                                    {dashboards?.map(dashboard => (
                                        <SelectItem key={dashboard.id} value={dashboard.name}>{dashboard.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <DashboardDialog
                                open={dialogOpen}
                                onOpenChange={setDialogOpen}
                                showOnClose={true}
                                editMode={editMode}
                                dashboards={dashboards}
                                userId={userId}
                                addDashboard={addDashboard}
                                addDashboardStatus={addDashboardStatus}
                            />
                        </div>
                    </div>
                }
            </div>
            <ProfilePopover editMode={editMode}/>
        </div>
    )
}

export {Header}