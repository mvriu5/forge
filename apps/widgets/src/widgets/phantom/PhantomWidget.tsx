"use client"

import React from "react"
import {Copy, Plug, Unplug} from "lucide-react"
import { WidgetProps, WidgetTemplate } from "../base/WidgetTemplate"
import {WidgetHeader} from "../base/WidgetHeader.tsx"
import { Button } from "@forge/ui/components/Button"
import { WidgetError } from "../base/WidgetError.tsx"
import { WidgetContent } from "../base/WidgetContent.tsx"
import { Skeleton } from "@forge/ui/components/Skeleton"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import {CopyButton} from "@forge/ui/components/CopyButton"

type PhantomHookReturn = {
    provider: any | null
    wallet: {
        address: string
        balance: {
            value: number
            currency: string
        }
    } | null
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    refetch: () => Promise<void>
}

interface PhantomWidgetProps extends WidgetProps {
    hook: PhantomHookReturn
}

const PhantomWidget: React.FC<PhantomWidgetProps> = ({widget, editMode, onWidgetDelete, hook}) => {

    const connectTooltip = tooltip<HTMLButtonElement>({
        message: hook.wallet ? "Disconnect your phantom wallet" : "Connect your phantom wallet",
        anchor: "tc"
    })

    return (
        <WidgetTemplate widget={widget} className={"flex flex-col gap-4 overflow-hidden"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Phantom"} className={"z-[1]"}>
                <Button
                    variant={"widget"}
                    onClick={() => hook.wallet ? hook.disconnect() : hook.connect()}
                    {...connectTooltip}
                >
                    {hook.wallet ? <Unplug size={16}/> : <Plug size={16}/>}
                </Button>
            </WidgetHeader>
            {!hook.wallet ? (
                <WidgetError
                    message={"Connect your Phantom wallet to use this widget!"}
                />
            ) : (
                <WidgetContent>
                    <div className={"flex flex-col"}>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Wallet address:</p>
                            {hook.isLoading ? (
                                <Skeleton className={"w-56 h-6"}/>
                            ) : (
                                <p className={"text-xs text-tertiary truncate"}>{hook.wallet?.address}</p>
                            )}
                            <CopyButton copyText={hook.wallet?.address ?? ""} className={"bg-0 hover:bg-0 p-0 m-1"} copyIcon={<Copy size={16}/>}/>
                        </div>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Current Balance:</p>
                            {hook.isLoading ? (
                                <Skeleton className={"w-20 h-6"}/>
                            ) : (
                                <p className={"text-lg text-semibold text-primary"}>{`$${hook.wallet?.balance.value.toFixed(2)}`}</p>
                            )}
                        </div>
                    </div>
                </WidgetContent>
            )}

        </WidgetTemplate>
    )
}

export {PhantomWidget}