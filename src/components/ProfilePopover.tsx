"use client"

import { useSession } from "@/hooks/useSession";
import {LogOut, Settings, User, Waypoints, Workflow} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger} from "lunalabs-ui";
import React, {useState} from "react"
import {authClient} from "@/lib/auth-client"
import {useRouter} from "next/navigation"

function ProfilePopover() {
    const session = useSession()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const onSignout = async () => {
        setOpen(false)
        await authClient.signOut()
        router.replace("/")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <div
                    data-state={open ? "open" : "closed"}
                    className={"h-8 flex items-center gap-2 bg-secondary hover:bg-tertiary data-[state=open]:bg-tertiary rounded-md px-2"}>
                    <Avatar className={"size-6 border border-main/20"}>
                        <AvatarImage src={session?.user?.image ?? ""}/>
                        <AvatarFallback className={"bg-gradient-to-br from-green-400 to-brand"}/>
                    </Avatar>
                    <p>{session?.user?.name}</p>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className={"p-1 w-36 gap-1"}
                align={"end"}
            >
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary"}
                >
                    <User size={16} className={"text-tertiary"}/>
                    <p>Profile</p>
                </button>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary"}
                >
                    <Waypoints size={16} className={"text-tertiary"}/>
                    <p>Integrations</p>
                </button>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary"}
                >
                    <Settings size={16} className={"text-tertiary"}/>
                    <p>Settings</p>
                </button>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-error/10 text-error"}
                    onClick={onSignout}
                >
                    <LogOut size={16} className={"text-error/65"}/>
                    <p>Logout</p>
                </button>
            </PopoverContent>
        </Popover>
    )
}

export {ProfilePopover}