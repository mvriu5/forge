"use client"

import React, {useState} from "react"
import {Blocks, LayoutDashboard, Settings as SettingsIcon, User, Wrench} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/Dialog"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/ToggleGroup"
import {IntegrationSection} from "@/components/sections/IntegrationSection"
import {ProfileSection} from "@/components/sections/ProfileSection"
import {DashboardSection} from "@/components/sections/DashboardSection"
import {SettingsSection} from "@/components/sections/SettingsSection"

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
            <DialogContent className={"p-0 w-[800px] max-w-[90vw]"}>
                    <DialogHeader>
                        <DialogTitle>
                            Settings
                        </DialogTitle>
                        <DialogDescription className={"sr-only"}/>
                    </DialogHeader>
                <div className={"flex h-[520px] max-h-[520px]"}>
                    <div className={"flex flex-col bg-secondary w-max h-full rounded-l-md border-r border-main/40 p-2"}>
                        <p className={"font-mono text-tertiary text-sm mb-2"}>
                            Settings
                        </p>
                        <ToggleGroup
                            type="single"
                            className={"flex flex-col gap-2 border-0 bg-transparent px-0 justify-start items-start"}
                            value={tab}
                            onValueChange={(value) => value && setTab(value)}
                        >
                            <ToggleGroupItem value="profile" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <User size={14}/>
                                Profile
                            </ToggleGroupItem>
                            <ToggleGroupItem value="integrations" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Blocks size={14}/>
                                Integrations
                            </ToggleGroupItem>
                            <ToggleGroupItem value="dashboards" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <LayoutDashboard size={14}/>
                                Dashboards
                            </ToggleGroupItem>
                            <ToggleGroupItem value="settings" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Wrench size={14}/>
                                Settings
                            </ToggleGroupItem>
                        </ToggleGroup>

                    </div>

                    <div className={"flex flex-col w-full h-full p-4 gap-4"}>
                        {tab === "profile" && <ProfileSection handleClose={() => setOpen(false)}/>}
                        {tab === "integrations" && <IntegrationSection handleClose={() => setOpen(false)}/>}
                        {tab === "dashboards" && <DashboardSection handleClose={() => setOpen(false)}/>}
                        {tab === "settings" && <SettingsSection handleClose={() => setOpen(false)}/>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export {SettingsDialog}