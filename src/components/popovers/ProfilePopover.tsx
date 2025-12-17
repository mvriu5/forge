"use client"

import {LogOut, MessageCircleQuestion} from "lucide-react"
import React, {useState} from "react"
import {SettingsDialog} from "@/components/dialogs/SettingsDialog"
import {cn} from "@/lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Skeleton} from "@/components/ui/Skeleton";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Spinner} from "@/components/ui/Spinner"
import {useSession} from "@/hooks/data/useSession"
import Link from "next/link"
import {useAuth} from "@/hooks/useAuth"
import {Button} from "@/components/ui/Button"

function ProfilePopover({editMode}: {editMode: boolean}) {
    const {session, isLoading: sessionLoading, setSession} = useSession()
    const {isLoading: signoutLoading, handleSignOut} = useAuth()

    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                disabled={sessionLoading || editMode}
                data-state={editMode ? "disabled" : "enabled"}
                className={"group"}
                asChild
            >
                <Button
                    data-state={open ? "open" : "closed"}
                    className={cn(
                        "h-8 md:border border-main/60 flex items-center gap-2 md:bg-secondary md:hover:bg-inverted/10 md:data-[state=open]:bg-inverted/10",
                        "rounded-md md:px-2 md:group-data-[state=disabled]:bg-secondary",
                        "md:group-data-[state=disabled]:hover:bg-secondary shadow-xs dark:shadow-md"
                    )}
                >
                    {sessionLoading ?
                        <Skeleton className={"size-6 rounded-full"}/> :
                        <Avatar className={"size-6 border border-main/20"}>
                            <AvatarImage src={session?.user?.image ?? undefined} />
                            <AvatarFallback/>
                        </Avatar>
                    }
                    {sessionLoading ?
                        <Skeleton className={"hidden md:flex h-4 w-12"}/> :
                        <p className={"hidden md:flex"}>{session?.user?.name}</p>
                    }
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={"p-1 w-max md:w-36 gap-1"}
                align={"end"}
            >
                <p className={"md:hidden flex items-center gap-1.5 mb-1 text-tertiary text-xs text-wrap font-mono px-2 py-1 rounded-md bg-tertiary"}>
                    Logged in as:
                    <span className={"inline break-words text-secondary font-sans"}>{session?.user?.name}</span>
                </p>
                <Link
                    href={"https://github.com/mvriu5/forge/issues"}
                    target={"_blank"}
                    rel={"noopener noreferrer"}
                >
                    <button
                        type={"button"}
                        className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary ring-0 outline-0"}
                    >
                        <MessageCircleQuestion size={16} className={"text-tertiary"}/>
                        <p>Issue</p>
                    </button>
                </Link>
                <SettingsDialog/>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-error/5 text-error/90 hover:text-error ring-0 outline-0"}
                    onClick={() => {
                        void handleSignOut()
                        setSession(null)
                    }}
                >
                    {signoutLoading ? <Spinner className={"text-error"}/> : <LogOut size={16} className={"text-error/65"}/>}
                    <p>Logout</p>
                </button>
            </PopoverContent>
        </Popover>
    )
}

export {ProfilePopover}