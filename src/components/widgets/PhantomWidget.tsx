"use client"

import React from "react"
import {Button} from "@/components/ui/Button"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {CopyButton} from "@/components/CopyButton"
import {Copy, Plug, Unplug} from "lucide-react"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Skeleton} from "../ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {useTooltip} from "@/components/ui/TooltipProvider"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import {AddressType, darkTheme, lightTheme, PhantomProvider, useModal, usePhantom} from "@phantom/react-sdk"
import {useTheme} from "next-themes"

const PhantomWidget: React.FC<WidgetProps> = () => {
    const {theme} = useTheme()
    const {user, isLoading, isConnected} = usePhantom()
    const {open, close, isOpened} = useModal()

    const connectTooltip = useTooltip<HTMLButtonElement>({
        message: user?.wallet ? "Disconnect your phantom wallet" : "Connect your phantom wallet",
        anchor: "tc"
    })

    return (
        <PhantomProvider
            config={{
                providers: ["google", "apple", "injected"],
                appId: process.env.PHANTOM_APP_ID,
                addressTypes: [AddressType.solana, AddressType.ethereum],
                authOptions: {
                    redirectUrl: `${process.env.BETTER_AUTH_URL}/api/auth/callback/phantom`,
                },
            }}
            theme={theme === "dark" ? darkTheme : lightTheme}
            appIcon="https://phantom-portal20240925173430423400000001.s3.ca-central-1.amazonaws.com/icons/af876894-5011-4cae-924d-4593293b233b.png"
            appName="forge"
        >
            <WidgetHeader title={"Phantom"} className={"z-[1]"}>
                <Button
                    variant={"widget"}
                    onClick={() => isConnected ? open() : close()}
                    {...connectTooltip}
                >
                    {user?.wallet ? <Unplug size={16}/> : <Plug size={16}/>}
                </Button>
            </WidgetHeader>
            {!user?.wallet ? (
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
                                <p className={"text-xs text-tertiary truncate"}>{user?.wallet?.name}</p>
                            )}
                            <CopyButton copyText={user?.wallet?.id ?? ""} className={"bg-0 hover:bg-0 p-0 m-1"} copyIcon={<Copy size={16}/>}/>
                        </div>
                        <div className={"flex flex-row items-center gap-2"}>
                            <p className={"text-nowrap"}>Current Balance:</p>
                            {isLoading ? (
                                <Skeleton className={"w-20 h-6"}/>
                            ) : (
                                <p className={"text-lg text-semibold text-primary"}>{`$${"test value"}`}</p>
                            )}
                        </div>
                    </div>
                </WidgetContent>
            )}
        </PhantomProvider>
    )
}

export const phantomWidgetDefinition = defineWidget({
    name: "Phantom",
    component: PhantomWidget,
    description: 'See your phantom wallet balance',
    image: "/github_preview.svg",
    tags: ["finance"],
    sizes: {
        desktop: { width: 1, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    }
})