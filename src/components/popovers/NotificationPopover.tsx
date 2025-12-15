"use client"

import {Archive, Bell, BellRing, Inbox, Mails, TriangleAlert} from "lucide-react"
import React, {useState} from "react"
import {cn, getTimeLabel} from "@/lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {useSession} from "@/hooks/data/useSession"
import {useNotifications} from "@/hooks/data/useNotifications"
import {Button} from "@/components/ui/Button"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {useTooltip} from "@/components/ui/TooltipProvider"

function NotificationPopover({editMode}: {editMode: boolean}) {
    const {userId, isLoading: sessionLoading} = useSession()
    const { notifications, clearNotifications} = useNotifications(userId)

    const [open, setOpen] = useState(false)

    const archiveTooltip = useTooltip({
        message: "Archive all notifications",
        anchor: "tc",
    })

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
                className={"h-full w-64 gap-1 p-0"}
                align={"end"}
            >
                <div className={"flex items-center gap-2 justify-between bg-tertiary p-2 border-b border-main/40"}>
                    <p className={"text-tertiary text-sm"}>
                        {notifications.length > 0 ? `${notifications.length} new notifications` : "Notifications"}
                    </p>
                    <Button onClick={() => clearNotifications()} variant={"ghost"} className={"size-8"} {...archiveTooltip}>
                        <Archive size={16}/>
                    </Button>
                </div>
                {notifications.length <= 0 ? (
                    <div className={"flex flex-col items-center justify-center h-72"}>
                        <Inbox size={32} className={"text-tertiary"} opacity={0.5}/>
                        <p className={"text-sm text-tertiary mt-2"}>
                            No notifications
                        </p>
                    </div>
                ) : (
                    <ScrollArea className={"h-72"}>
                        <div className={"h-full flex flex-col gap-1 overflow-y-auto p-2"}>
                            {notifications?.map((notification) => (
                                <div key={notification.id} className={"flex items-center gap-2 p-2 rounded-md hover:bg-tertiary"}>
                                    <div className={"flex items-center justify-center size-8 bg-tertiary rounded-md"}>
                                        {notification.type === "message" && (
                                        <Mails size={20} className={"text-green-400"}/>
                                        )}
                                        {notification.type === "alert" && (
                                        <TriangleAlert size={20} className={"text-yellow-400"}/>
                                        )}
                                        {notification.type === "reminder" && (
                                        <BellRing size={20} className={"text-info"}/>
                                        )}
                                    </div>
                                    <div className={"flex flex-col"}>
                                        <p className={"text-sm"}>
                                            {notification.message}
                                        </p>
                                        <p className={"text-xs text-tertiary mt-1"}>
                                            {getTimeLabel(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

            </PopoverContent>
        </Popover>
    )
}

export {NotificationPopover}