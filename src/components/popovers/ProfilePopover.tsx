"use client"

import {LogOut} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger} from "lunalabs-ui";
import React, {useState} from "react"
import {authClient} from "@/lib/auth-client"
import {useRouter} from "next/navigation"
import {useSessionStore} from "@/store/sessionStore"
import {SettingsDialog} from "@/components/dialogs/SettingsDialog"

function ProfilePopover() {
    const { session, setSession } = useSessionStore()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const onSignout = async () => {
        setOpen(false)
        setSession(null)
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
                        <AvatarFallback className={"bg-gradient-to-br from-brand/20 to-brand"}/>
                    </Avatar>
                    <p>{session?.user?.name}</p>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className={"p-1 w-36 gap-1 border-main/40"}
                align={"end"}
            >
                <SettingsDialog/>
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