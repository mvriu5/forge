"use client"

import {Button} from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
    DialogDescription
} from "@/components/ui/Dialog"
import {Input} from "@/components/ui/Input"
import {Copy, Grid2x2Plus, PanelsTopLeft, Share2} from "lucide-react"
import React, { useState } from "react"
import {cn} from "@/lib/utils"
import Image from "next/image"
import {useWidgetStore} from "@/store/widgetStore"
import {useSessionStore} from "@/store/sessionStore"
import {getAllWidgetPreviews, type WidgetPreview} from "@/lib/widgetRegistry"
import { tooltip } from "@/components/ui/TooltipProvider"
import {ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { ScrollArea } from "@/components/ui/ScrollArea"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {Callout} from "@/components/ui/Callout"
import {CopyButton} from "@/components/CopyButton"

function ShareDialog({editMode}: {editMode: boolean}) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const buttonTooltip = tooltip<HTMLButtonElement>({
        message: "Share your dashboards",
        anchor: "bc"
    })

    const dashboards = [
        {
            name: "Dashboard 1",
            url: "https://tryforge.io/dashboards/115729821",
            views: 0
        },
        {
            name: "Dashboard 2",
            url: "https://tryforge.io/dashboards/115729821",
            views: 2
        }
    ]

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className={"px-2 gap-2 text-tertiary"} {...buttonTooltip} variant={"ghost"} disabled={editMode}>
                    <Share2 size={16}/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-[650px] pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-start"}>
                    <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                        Share
                        <p className={"text-secondary text-sm font-normal"}>Manage your dashboards & share it with your friends</p>
                    </DialogTitle>
                    <DialogClose className={""}/>
                </DialogHeader>

                <div className={"flex flex-col gap-4"}>
                    {dashboards.map((db) => (
                        <Callout variant={"default"} className={"flex items-center gap-2 px-4 border border-main/40"}>
                            <p className={"font-semibold text-brand mr-2"}>{db.name}</p>
                            <p className={"text-tertiary"}>{db.url}</p>
                            <CopyButton copyText={db.url}/>
                        </Callout>
                    ))}
                </div>

                <DialogFooter className={"pr-4"}>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export {ShareDialog}