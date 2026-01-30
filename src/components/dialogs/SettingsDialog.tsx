"use client"

import { DashboardSection } from "@/components/sections/DashboardSection"
import { IntegrationSection } from "@/components/sections/IntegrationSection"
import { ProfileSection } from "@/components/sections/ProfileSection"
import { SettingsSection } from "@/components/sections/SettingsSection"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/Dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Blocks, LayoutDashboard, Settings as SettingsIcon, User, Wrench } from "lucide-react"
import { Activity, useState } from "react"

function SettingsDialog() {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("profile")

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => setOpen(prev)}
        >
            <DialogTrigger asChild onClick={() => setTab("profile")}>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary ring-0 outline-0"}
                >
                    <SettingsIcon size={16} className={"text-tertiary"}/>
                    <p>Settings</p>
                </button>
            </DialogTrigger>
            <DialogContent className={"p-0 w-200 max-w-[90vw] overflow-hidden"}>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>
                            Settings
                        </DialogTitle>
                        <DialogDescription className={"sr-only"}/>
                    </DialogHeader>
                </VisuallyHidden>
                <div className={"flex flex-col sm:flex-row h-130 max-h-130"}>
                    <div className={"flex flex-col sm:bg-secondary w-full sm:w-max sm:h-full rounded-none sm:rounded-l-md border-b sm:border-r border-main/40 p-2 pb-4 sm:pb-2"}>

                        <ToggleGroup
                            type="single"
                            className={"flex flex-row sm:flex-col gap-0 sm:gap-2 border-0 bg-transparent px-0 justify-start items-start"}
                            value={tab}
                            onValueChange={(value) => value && setTab(value)}
                        >
                            <ToggleGroupItem value="profile" className={"w-full flex items-center justify-center sm:justify-start gap-1 text-left px-1 sm:px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <User size={14}/>
                                Profile
                            </ToggleGroupItem>
                            <ToggleGroupItem value="integrations" className={"w-full flex items-center justify-center sm:justify-start gap-1 text-left sm:px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Blocks size={14}/>
                                Integrations
                            </ToggleGroupItem>
                            <ToggleGroupItem value="dashboards" className={"w-full flex items-center justify-center sm:justify-start gap-1 text-left sm:px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <LayoutDashboard size={14}/>
                                Dashboards
                            </ToggleGroupItem>
                            <ToggleGroupItem value="settings" className={"w-full flex items-center justify-center sm:justify-start gap-1 text-left sm:px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Wrench size={14}/>
                                Settings
                            </ToggleGroupItem>
                        </ToggleGroup>

                    </div>

                    <div className={"flex flex-col w-full h-full p-4 gap-4"}>
                        <Activity mode={tab === "profile" ? "visible" : "hidden"}>
                            <ProfileSection handleClose={() => setOpen(false)}/>
                        </Activity>
                        <Activity mode={tab === "integrations" ? "visible" : "hidden"}>
                            <IntegrationSection handleClose={() => setOpen(false)}/>
                        </Activity>
                        <Activity mode={tab === "dashboards" ? "visible" : "hidden"}>
                            <DashboardSection handleClose={() => setOpen(false)}/>
                        </Activity>
                        <Activity mode={tab === "settings" ? "visible" : "hidden"}>
                            <SettingsSection handleClose={() => setOpen(false)}/>
                        </Activity>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { SettingsDialog }
