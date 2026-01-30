"use client"

import DashboardDialog from "@/components/dialogs/DashboardDialog"
import { WidgetDialog } from "@/components/dialogs/WidgetDialog"
import { NotificationPopover } from "@/components/popovers/NotificationPopover"
import { ProfilePopover } from "@/components/popovers/ProfilePopover"
import { ForgeLogo } from "@/components/svg/ForgeLogo"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Spinner } from "@/components/ui/Spinner"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { Dashboard, DashboardInsert } from "@/database"
import { LayoutTemplate, Maximize, Minimize, Save, Undo2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Skeleton } from "./ui/Skeleton"

interface HeaderProps {
    editMode: boolean
    editModeLoading?: boolean
    handleEditModeCancel: () => void
    handleEditModeSave: () => void
    onEdit: () => void
    widgetsEmpty: boolean
    isLoading: boolean
    isOnboarding: boolean
    dashboards: Dashboard[] | null
    currentDashboard: Dashboard | null
    onDashboardChange: (dashboardId: string | null) => Promise<void> | void
    addDashboard: (input: DashboardInsert) => Promise<Dashboard>
    addDashboardStatus: "idle" | "pending" | "error" | "success"
    userId?: string
    isFullscreen: boolean
    toggleFullScreen: () => void
}

function Header({dashboards, currentDashboard, onEdit, editMode, editModeLoading = false, handleEditModeSave, handleEditModeCancel, widgetsEmpty = false, isLoading = false, isOnboarding, onDashboardChange, addDashboard, addDashboardStatus, userId, isFullscreen, toggleFullScreen}: HeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false)
    const [isNotificationPopoverOpen, setNotificationPopoverOpen] = useState(false)

    const layoutTooltip = useTooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        shortcut: "E",
        anchor: "bc",
        offset: 12
    })

    const fullscreenTooltip = useTooltip<HTMLButtonElement>({
        message: `${isFullscreen ? "Minimize" : "Maximize"} your window`,
        anchor: "bc",
        offset: 12
    })

    const handleSelectDashboard = async (value: string) => {
        const newDashboard = dashboards?.find(d => d.name === value) ?? null
        if (!newDashboard) return
        await onDashboardChange(newDashboard.id)
    }

    useEffect(() => {
        if (!isFullscreen) setIsHeaderVisible(true)
    }, [isFullscreen])

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleMouseMove = (event: MouseEvent) => {
            if (!isFullscreen) return

            if (event.clientY < 60) {
                setIsHeaderVisible(true)
            } else {
                if (isProfilePopoverOpen || isNotificationPopoverOpen) return
                clearTimeout(timeout)
                timeout = setTimeout(() => setIsHeaderVisible(false), 200)
            }
        }

        if (isFullscreen) {
            window.addEventListener("mousemove", handleMouseMove)
            if (!isProfilePopoverOpen && !isNotificationPopoverOpen) {
                const initialTimeout = setTimeout(() => setIsHeaderVisible(false), 2000)
                return () => {
                    window.removeEventListener("mousemove", handleMouseMove)
                    clearTimeout(timeout)
                    clearTimeout(initialTimeout)
                }
            }
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            clearTimeout(timeout)
        }
    }, [isFullscreen, isProfilePopoverOpen, isNotificationPopoverOpen])

    return (
        <div className={`fixed z-50 w-full top-0 left-0 py-2 px-4 flex justify-between items-center bg-primary border-b border-main/40 transition-transform duration-300 ${!isHeaderVisible ? "-translate-y-full" : ""}`}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
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
                        <WidgetDialog editMode={editMode} isOnboarding={isOnboarding} />
                        <Button className={"size-8 bg-secondary border-main/60 hidden xl:flex"}
                            onClick={onEdit}
                            disabled={editMode || widgetsEmpty || isLoading}
                            {...layoutTooltip}
                        >
                            <LayoutTemplate size={16} />
                        </Button>
                        <Button
                            className="size-8 bg-secondary border-main/60 hidden xl:flex"
                            onClick={toggleFullScreen}
                            {...fullscreenTooltip}
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </Button>
                        <div className={"flex"}>
                            <Select
                                value={currentDashboard?.name ?? ""}
                                onValueChange={handleSelectDashboard}
                                disabled={dashboards?.length === 0 || editMode}
                            >
                                <SelectTrigger className={"max-w-70 bg-primary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary flex lg:rounded-r-none gap-0.5"} disabled={editMode}>
                                    <div className={"w-full flex items-center gap-1 overflow-hidden text-xs"}>
                                        <p className={"hidden md:flex text-tertiary text-xs font-mono"}>Dashboard:</p>
                                        {isLoading ?
                                            <Skeleton className={"w-10 h-4"}/> :
                                            <SelectValue className={"truncate"}/>
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
            <div className={"flex items-center gap-2"}>
                <NotificationPopover editMode={editMode} open={isNotificationPopoverOpen} onOpenChange={setNotificationPopoverOpen}/>
                <ProfilePopover editMode={editMode} open={isProfilePopoverOpen} onOpenChange={setProfilePopoverOpen}/>
            </div>
        </div>
    )
}

export { Header }
