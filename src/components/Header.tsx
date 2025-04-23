"use client"

import {Button} from "@/components/ui/Button"
import {LayoutTemplate} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {tooltip} from "@/components/ui/TooltipProvider"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import React, {useState} from "react"
import {useDashboardStore} from "@/store/dashboardStore"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"

interface HeaderProps {
    onEdit: () => void
    editMode: boolean
    widgetsEmpty?: boolean
}

function Header({onEdit, editMode, widgetsEmpty = false}: HeaderProps) {
    const {dashboards, currentDashboard} = useDashboardStore()

    const [dialogOpen, setDialogOpen] = useState(false)

    const layoutTooltip = tooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        anchor: "bc",
        offset: 12
    })

    return (
        <div className={"w-full top-0 left-0 h-14 px-8 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <ForgeLogo/>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main"}/>
                <div className={"flex gap-2"}>
                    <WidgetDialog editMode={editMode}/>
                    <Button className={"size-8 bg-secondary border-main/60 hidden xl:flex"} {...layoutTooltip} onClick={onEdit} disabled={editMode || widgetsEmpty}>
                        <LayoutTemplate size={16}/>
                    </Button>
                    <div className={"flex"}>
                        <Select
                            value={currentDashboard?.name ?? ""}
                            onValueChange={(value) => {
                                const dashboard = dashboards?.find(d => d.name === value)
                                if (dashboard) useDashboardStore.setState({ currentDashboard: dashboard })
                            }}
                            disabled={!dashboards || dashboards.length === 0 || editMode}
                        >
                            <SelectTrigger className={"max-w-[280px] bg-primary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary hidden lg:flex rounded-r-none"} disabled={editMode}>
                                <div className={"w-full flex items-center gap-2 overflow-hidden"}>
                                    <p className={"text-tertiary text-xs font-mono"}>Dashboard: </p>
                                    <SelectValue className={"truncate"}/>
                                </div>
                            </SelectTrigger>
                            <SelectContent align={"end"} className={"border-main/40"}>
                                {dashboards?.map(dashboard => (
                                    <SelectItem key={dashboard.id} value={dashboard.name}>{dashboard.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DashboardDialog open={dialogOpen} onOpenChange={setDialogOpen} showOnClose={true} editMode={editMode}/>
                    </div>
                </div>
            </div>
            <ProfilePopover editMode={editMode}/>
        </div>
    )
}

export {Header}