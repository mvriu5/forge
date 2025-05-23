"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Button} from "@/components/ui/Button"
import { useFitbit } from "@/hooks/useFitbit"

const FitbitWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {

    }

    const {} = useFitbit()

    return (
        <WidgetTemplate id={id} className={"flex flex-col gap-4 col-span-1 row-span-1 overflow-hidden"} name={"phantom"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Fitbit"} className={"text-primary size-6"}>
                <Button onClick={() => wallet ? disconnect() : connect()}>
                    {wallet ? "Disconnect" : "Connect"}
                </Button>
            </WidgetHeader>
        </WidgetTemplate>
    )
}

export {FitbitWidget}
