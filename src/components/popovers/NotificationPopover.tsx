"use client"

import {Bell, LogOut, MessageCircleQuestion, Sun} from "lucide-react"
import React, {useState} from "react"
import {SettingsDialog} from "@/components/dialogs/SettingsDialog"
import {cn} from "@/lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Skeleton} from "@/components/ui/Skeleton";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {useTheme} from "next-themes"
import {Spinner} from "@/components/ui/Spinner"
import {useSession} from "@/hooks/data/useSession"
import Link from "next/link"
import {useAuth} from "@/hooks/useAuth"
import {useNotifications} from "@/hooks/data/useNotifications"
import {Button} from "@/components/ui/Button"
import {ScrollArea} from "@/components/ui/ScrollArea"

function NotificationPopover({editMode}: {editMode: boolean}) {
    const {userId, session, isLoading: sessionLoading, setSession} = useSession()
    const { notifications, connected, sendNotification, clearNotifications} = useNotifications(userId)

    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                disabled={sessionLoading || editMode}
                asChild
            >
                <Button
                    data-state={open ? "open" : "closed"}
                    className={cn("size-8 bg-secondary border-main/60 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary")}
                    onClick={() => setOpen(!open)}
                >
                   <Bell size={16}/>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={"p-2 h-full w-56 gap-1"}
                align={"end"}
            >
                <p className={"text-tertiary font-mono text-xs"}>
                    Notifications
                </p>
                <ScrollArea className={"h-72"}>
                    <div className={"h-full flex flex-col gap-1 overflow-y-auto"}>
                        {notifications?.map((notification) => (
                            <div key={notification.id} className={"p-2 rounded-md hover:bg-secondary/50"}>
                                <p className={"text-sm"}>
                                    {notification.message}
                                </p>
                                <p className={"text-xs text-tertiary mt-1"}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

export {NotificationPopover}