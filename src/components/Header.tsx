"use client"

import {Button} from "@/components/ui/Button"
import {Anvil, LayoutTemplate} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import { tooltip } from "@/components/ui/TooltipProvider"
import {ForgeLogo} from "@/components/svg/ForgeLogo"

interface HeaderProps {
    onEdit: () => void
    editMode: boolean
    widgetsEmpty?: boolean
}

function Header({onEdit, editMode, widgetsEmpty = false}: HeaderProps) {

    const layoutTooltip = tooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        anchor: "bc",
        offset: 12
    })

    return (
        <div className={"w-full top-0 left-0 h-14 px-8 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <ForgeLogo/>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main"}/>
                <div className={"flex gap-2"}>
                    <WidgetDialog editMode={editMode}/>
                    <Button className={"size-8 bg-secondary border-main/60 hidden xl:flex"} {...layoutTooltip} onClick={onEdit} disabled={editMode || widgetsEmpty}>
                        <LayoutTemplate size={16}/>
                    </Button>
                </div>
            </div>
            <ProfilePopover editMode={editMode}/>
        </div>
    )
}

export {Header}