"use client"

import {Bug, Hourglass, LogOut, MessageCircleQuestion} from "lucide-react";
import React, {useEffect, useState} from "react"
import {authClient} from "@/lib/auth-client"
import {useRouter} from "next/navigation"
import {useSessionStore} from "@/store/sessionStore"
import {SettingsDialog} from "@/components/dialogs/SettingsDialog"
import {cn} from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {ButtonSpinner} from "@/components/ButtonSpinner"

function ProfilePopover({editMode}: {editMode: boolean}) {
    const {session, setSession} = useSessionStore()
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [signOutLoading, setSignOutLoading] = useState(false)

    useEffect(() => {
        if (session) setLoading(false)
    }, [session])

    const onSignout = async () => {
        setSignOutLoading(true)

        await authClient.signOut()

        router.replace("/")

        setTimeout(() => {
            setSession(null)
        }, 500)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                disabled={loading || editMode}
                data-state={editMode ? "disabled" : "enabled"}
                className={"group"}
            >
                <div
                    data-state={open ? "open" : "closed"}
                    className={cn(
                        "h-8 md:border border-main/20 flex items-center gap-3 md:bg-secondary md:hover:bg-tertiary md:data-[state=open]:bg-tertiary",
                        "rounded-md md:px-3 md:group-data-[state=disabled]:bg-secondary",
                        "md:group-data-[state=disabled]:hover:bg-secondary"
                    )}
                >
                    {loading ?
                        <Skeleton className={"size-6 rounded-full"}/> :
                        <Avatar className={"size-6 border border-main/20"}>
                            <AvatarImage src={session?.user?.image ?? undefined} />
                            <AvatarFallback/>
                        </Avatar>
                    }
                    {loading ?
                        <Skeleton className={"hidden md:flex h-4 w-12"}/> :
                        <p className={"hidden md:flex"}>{session?.user?.name}</p>
                    }
                </div>
            </PopoverTrigger>
            <PopoverContent
                className={"p-1 w-max md:w-36 gap-1"}
                align={"end"}
            >
                <p className={"md:hidden flex items-center gap-1.5 text-tertiary text-xs text-wrap font-mono px-2 py-1 rounded-md bg-tertiary"}>
                    Logged in as:
                    <span className={"inline break-words text-secondary font-sans"}>{session?.user?.name}</span>
                </p>
                <button
                    type={"button"}
                    onClick={() => window.open("https://github.com/mvriu5/forge/issues")}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary"}
                >
                    <MessageCircleQuestion size={16} className={"text-tertiary"}/>
                    <p>Help</p>
                </button>
                <SettingsDialog/>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-error/10 text-error"}
                    onClick={onSignout}
                >
                    {signOutLoading ? <ButtonSpinner className={"text-error"}/> : <LogOut size={16} className={"text-error/65"}/>}
                    <p>Logout</p>
                </button>
            </PopoverContent>
        </Popover>
    )
}

export {ProfilePopover}