"use client"

import {Button, tooltip} from "lunalabs-ui"
import {Anvil, LayoutTemplate} from "lucide-react"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"

interface HeaderProps {
    onEdit: () => void
    editMode: boolean
}

function Header({onEdit, editMode}: HeaderProps) {

    const layoutTooltip = tooltip<HTMLButtonElement>({
        message: "Change your dashboard layout",
        anchor: "bc",
        offset: 12
    })

    return (
        <div className={"w-full top-0 left-0 h-14 px-2 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-2"}>
                    <Anvil size={22}/>
                    <span className={"text-xl font-semibold"}>Forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main"}/>
                <div className={"flex gap-2"}>
                    <WidgetDialog editMode={editMode}/>
                    <Button className={"size-8"} {...layoutTooltip} onClick={onEdit} disabled={editMode}>
                        <LayoutTemplate size={16}/>
                    </Button>
                </div>
            </div>
            <ProfilePopover editMode={editMode}/>
        </div>
    )
}

export {Header}