"use client"

import {Button} from "@/components/ui/Button"
import {LayoutTemplate, Save, Undo2} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import {tooltip} from "@/components/ui/TooltipProvider"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import React, {useState} from "react"
import {useDashboardStore} from "@/store/dashboardStore"
import {DashboardDialog} from "@/components/dialogs/DashboardDialog"
import {Skeleton} from "./ui/Skeleton"
import Link from "next/link"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {useSettingsStore} from "@/store/settingsStore"

interface HeaderProps {
    editMode: boolean
    editModeLoading?: boolean
    handleEditModeCancel?: () => void
    handleEditModeSave?: () => void
    onEdit: () => void
    widgetsEmpty?: boolean
    isLoading?: boolean
}

function Header({onEdit, editMode, editModeLoading = false, handleEditModeSave, handleEditModeCancel, widgetsEmpty = false, isLoading = false}: HeaderProps) {
    const {dashboards, currentDashboard} = useDashboardStore()
    const {settings, updateSettings} = useSettingsStore()

    const [dialogOpen, setDialogOpen] = useState(false)

    const layoutTooltip = tooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        shortcut: "E",
        anchor: "bc",
        offset: 12
    })

    const onChangeDashboard = async (value: string) => {
        const dashboard = dashboards?.find(d => d.name === value)
        if (!dashboard) return
        if (!settings) return

        useDashboardStore.setState({currentDashboard: dashboard})
        const newSettings = {
            id: settings.id,
            userId: settings.userId,
            lastDashboardId: dashboard.id,
            config: settings,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        }
        await updateSettings(newSettings)
    }

    return (
        <div className={"w-full top-0 left-0 h-12 px-4 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <Link href={"/?allowLanding=true"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main/40"}/>
                {editMode ?
                    <div className={"flex gap-2"}>
                        <Button variant="brand" onClick={handleEditModeSave} className={"h-8 px-2"}>
                            {editModeLoading ? <ButtonSpinner/> : <Save size={16} className={"mr-2"}/>}
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
                                onValueChange={onChangeDashboard}
                                disabled={!dashboards || dashboards.length === 0 || editMode}
                            >
                                <SelectTrigger className={"max-w-[280px] bg-primary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary hidden lg:flex rounded-r-none gap-0.5"} disabled={editMode}>
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
                            <DashboardDialog open={dialogOpen} onOpenChange={setDialogOpen} showOnClose={true} editMode={editMode}/>
                        </div>
                    </div>
                }
            </div>
            <ProfilePopover editMode={editMode}/>
        </div>
    )
}

export {Header}