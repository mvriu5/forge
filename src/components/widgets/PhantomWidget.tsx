"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {usePhantom} from "@/hooks/usePhantom"
import {Button} from "@/components/ui/Button"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {PhantomIcon} from "@/components/svg/PhantomIcon"
import {CopyButton} from "@/components/CopyButton"
import {Copy, TriangleAlert} from "lucide-react"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Callout} from "@/components/ui/Callout"
import { Skeleton } from "../ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"

const PhantomWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        return (
            <WidgetTemplate id={id} className={"flex flex-col gap-4 col-span-1 row-span-1 overflow-hidden"} name={"phantom"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader title={"Phantom"} icon={ <PhantomIcon className={"text-primary size-6"}/> } className={"z-[1]"}>
                    <Button onClick={() => wallet ? disconnect() : connect()}>
                        Disconnect
                    </Button>
                </WidgetHeader>

                <WidgetContent>
                    <div className={"flex flex-col z-[1]"}>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Wallet address:</p>
                            <p className={"text-xs text-tertiary truncate"}>GsX82Dc357Ca9aSSaN8ccKwh7Hwgwz1mL1pV27fjm6PebxWWSf</p>
                            <CopyButton copyText={""} className={"bg-0 hover:bg-0 p-0 m-1"} copyIcon={<Copy size={16}/>}/>
                        </div>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Current Balance:</p>
                            <p className={"text-lg text-semibold text-primary"}>$100.27</p>
                        </div>
                    </div>
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const {provider, wallet, connect, disconnect, isLoading, isFetching, isError, refetch} = usePhantom()

    return (
        <WidgetTemplate id={id} className={"flex flex-col gap-4 col-span-1 row-span-1 overflow-hidden"} name={"phantom"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Phantom"} icon={ <PhantomIcon className={"text-primary size-6"}/> } className={"z-[1]"}>
                <Button onClick={() => wallet ? disconnect() : connect()}>
                    {wallet ? "Disconnect" : "Connect"}
                </Button>
            </WidgetHeader>
            {!wallet ? (
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Phantom wallet first!"}
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