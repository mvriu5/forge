"use client"

import {Button} from "@/components/ui/Button"
import {Anvil, LayoutTemplate} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import { tooltip } from "@/components/ui/TooltipProvider"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {ShareDialog} from "@/components/dialogs/ShareDialog"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import React, { useState } from "react"
import {useDashboardStore} from "@/store/dashboardStore"
import {useSessionStore} from "@/store/sessionStore"

interface HeaderProps {
    onEdit: () => void
    editMode: boolean
    widgetsEmpty?: boolean
}

function Header({onEdit, editMode, widgetsEmpty = false}: HeaderProps) {
    const {dashboards} = useDashboardStore()

    const [selectedDashboard, setSelectedDashboard] = useState("")

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
                    <Select
                        value={selectedDashboard}
                        onValueChange={(value) => {
                            useDashboardStore.setState({ currentDashboard: dashboards?.find(d => d.name === value)})
                            setSelectedDashboard(value)
                        }}
                    >
                        <SelectTrigger className={"w-[200px] bg-tertiary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary hidden lg:flex"} disabled={editMode}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent align={"end"} className={"border-main/40"}>
                            {dashboards?.map(dashboard => (
                                <SelectItem value={dashboard.name}>{dashboard.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className={"flex items-center gap-2"}>
                <ShareDialog editMode={editMode}/>
                <ProfilePopover editMode={editMode}/>
            </div>
        </div>
    )
}

export {Header}