"use client"

import React, {useCallback, useMemo, useRef, useState} from "react"
import {
    Blocks,
    Check,
    CircleUserRound,
    LayoutDashboard,
    Pencil,
    Settings as SettingsIcon,
    Trash,
    User,
    Wrench,
    X
} from "lucide-react"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {cn} from "@/lib/utils"
import {authClient} from "@/lib/auth-client"
import type {PutBlobResult} from "@vercel/blob"
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/ToggleGroup"
import {Button} from "@/components/ui/Button"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Input} from "@/components/ui/Input"
import {Github, Google} from "@/components/svg/Icons"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Dashboard, Settings} from "@/database"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {RadioGroup} from "@/components/ui/RadioGroup"
import {RadioGroupBox} from "@/components/ui/RadioGroupBox"
import {Spinner} from "@/components/ui/Spinner"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useSettings} from "@/hooks/data/useSettings"
import {toast} from "sonner"
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
            <DialogContent className={"p-0 max-w-2/5"}>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>
                            Settings
                        </DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                <div className={"flex h-96"}>
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
                        {tab === "dashboards" && <DashboardSection />}
                        {tab === "settings" && <SettingsSection handleClose={() => setOpen(false)}/>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export {SettingsDialog}