"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {usePhantom} from "@/hooks/usePhantom"
import {Button} from "@/components/ui/Button"

const PhantomWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {provider, wallet, connect, disconnect, isLoading, isFetching, isError, refetch} = usePhantom()

    return (
        <WidgetTemplate className={"col-span-1 row-span-1"} name={"phantom"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className={"flex flex-col gap-2"}>
                <Button onClick={connect}>
                    Connect
                </Button>
                <Button onClick={disconnect}>
                    Disconnect
                </Button>
                <p>{wallet?.address}</p>
                <p>{wallet?.balance.value}</p>
            </div>
        </WidgetTemplate>
    )
}

export {PhantomWidget}