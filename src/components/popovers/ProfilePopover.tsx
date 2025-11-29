"use client"

import {LogOut, MessageCircleQuestion, Sun} from "lucide-react"
import React, {useState} from "react"
import {authClient} from "@/lib/auth-client"
import {useRouter} from "next/navigation"
import {SettingsDialog} from "@/components/dialogs/SettingsDialog"
import {cn} from "@/lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Skeleton} from "@/components/ui/Skeleton";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {useTheme} from "next-themes"
import {Spinner} from "@/components/ui/Spinner"
import {useSession} from "@/hooks/data/useSession"
import Link from "next/link"

function ProfilePopover({editMode}: {editMode: boolean}) {
    const {session, isLoading, setSession} = useSession()
    const router = useRouter()
    const {theme, setTheme} = useTheme()

    const [open, setOpen] = useState(false)
    const [signOutLoading, setSignOutLoading] = useState(false)

    const onSignout = async () => {
        setSignOutLoading(true)

        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/")
                    setSession(null)
                }
            }
        })

        router.push("/")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                disabled={isLoading || editMode}
                data-state={editMode ? "disabled" : "enabled"}
                className={"group"}
            >
                <div
                    data-state={open ? "open" : "closed"}
                    className={cn(
                        "h-8 md:border border-main/20 flex items-center gap-2 md:bg-secondary md:hover:bg-tertiary md:data-[state=open]:bg-tertiary",
                        "rounded-md md:px-2 md:group-data-[state=disabled]:bg-secondary",
                        "md:group-data-[state=disabled]:hover:bg-secondary shadow-xs dark:shadow-md"
                    )}
                >
                    {isLoading ?
                        <Skeleton className={"size-6 rounded-full"}/> :
                        <Avatar className={"size-6 border border-main/20"}>
                            <AvatarImage src={session?.user?.image ?? undefined} />
                            <AvatarFallback/>
                        </Avatar>
                    }
                    {isLoading ?
                        <Skeleton className={"hidden md:flex h-4 w-12"}/> :
                        <p className={"hidden md:flex"}>{session?.user?.name}</p>
                    }
                </div>
            </PopoverTrigger>
            <PopoverContent
                className={"p-1 w-max md:w-36 gap-1"}
                align={"end"}
            >
                <p className={"md:hidden flex items-center gap-1.5 mb-1 text-tertiary text-xs text-wrap font-mono px-2 py-1 rounded-md bg-tertiary"}>
                    Logged in as:
                    <span className={"inline break-words text-secondary font-sans"}>{session?.user?.name}</span>
                </p>
                <Link href={"https://github.com/mvriu5/forge/issues"}>
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
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary ring-0 outline-0"}
                    onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}
                >
                    <Sun size={16} className={"text-tertiary"}/>
                    <p>Theme</p>
                </button>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-error/5 text-error/90 hover:text-error ring-0 outline-0"}
                    onClick={onSignout}
                >
                    {signOutLoading ? <Spinner className={"text-error"}/> : <LogOut size={16} className={"text-error/65"}/>}
                    <p>Logout</p>
                </button>
            </PopoverContent>
        </Popover>
    )
}

export {ProfilePopover}