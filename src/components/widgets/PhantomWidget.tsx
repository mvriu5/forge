"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {usePhantom} from "@/hooks/usePhantom"
import {Button} from "@/components/ui/Button"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {PhantomIcon} from "@/components/svg/PhantomIcon"
import {CopyButton} from "@/components/CopyButton"
import {Copy, Plug, TriangleAlert, Unplug} from "lucide-react"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Callout} from "@/components/ui/Callout"
import { Skeleton } from "../ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {tooltip} from "@/components/ui/TooltipProvider"

const PhantomWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {provider, wallet, connect, disconnect, isLoading, isFetching, isError, refetch} = usePhantom()

    const connectTooltip = tooltip<HTMLButtonElement>({
        message: wallet ? "Disconnect your phantom wallet" : "Connect your phantom wallet",
        anchor: "tc"
    })

    return (
        <WidgetTemplate id={id} widget={widget} className={"flex flex-col gap-4 overflow-hidden"} name={"phantom"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Phantom"} className={"z-[1]"}>
                <Button
                    variant={"widget"}
                    onClick={() => wallet ? disconnect() : connect()}
                    {...connectTooltip}
                >
                    {wallet ? <Unplug size={16}/> : <Plug size={16}/>}
                </Button>
            </WidgetHeader>
            {!wallet ? (
                <WidgetError
                    message={"Connect your Phantom wallet to use this widget!"}
                />
            ) : (
                <WidgetContent>
                    <div className={"flex flex-col"}>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Wallet address:</p>
                            {isLoading ? (
                                <Skeleton className={"w-56 h-6"}/>
                            ) : (
                                <p className={"text-xs text-tertiary truncate"}>{wallet?.address}</p>
                            )}
                            <CopyButton copyText={wallet?.address ?? ""} className={"bg-0 hover:bg-0 p-0 m-1"} copyIcon={<Copy size={16}/>}/>
                        </div>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Current Balance:</p>
                            {isLoading ? (
                                <Skeleton className={"w-20 h-6"}/>
                            ) : (
                                <p className={"text-lg text-semibold text-primary"}>{`$${wallet?.balance.value.toFixed(2)}`}</p>
                            )}
                        </div>
                    </div>
                </WidgetContent>
            )}
        </WidgetTemplate>
    )
}

export {PhantomWidget}