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
import {AddressType, darkTheme, lightTheme, PhantomProvider, useAccounts, useDisconnect, useDiscoveredWallets, useModal, usePhantom} from "@phantom/react-sdk"
import {useTheme} from "next-themes"

const PhantomWidget: React.FC<WidgetProps> = () => {
    const {theme} = useTheme()

    return (
        <PhantomProvider
            config={{
                appId: process.env.NEXT_PUBLIC_PHANTOM_APP_ID!,
                providers: ["google", "apple", "injected", "deeplink"],
                addressTypes: [AddressType.solana],
                authOptions: {
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                },
            }}
            theme={theme === "dark" ? darkTheme : lightTheme}
            appIcon="https://phantom-portal20240925173430423400000001.s3.ca-central-1.amazonaws.com/icons/af876894-5011-4cae-924d-4593293b233b.png"
            appName="forge"
        >
            <PhantomWalletInfo />
        </PhantomProvider>
    )
}

function PhantomWalletInfo() {
    const {user, isLoading, isConnected} = usePhantom()
    const {open} = useModal()
    const {disconnect, isDisconnecting} = useDisconnect()
    const {wallets} = useDiscoveredWallets()

    const connectTooltip = useTooltip<HTMLButtonElement>({
        message: user?.wallet ? "Disconnect your wallet" : "Login to your phantom wallet",
        anchor: "tc"
    })

    return (
        <>
        <WidgetHeader title={"Phantom"} className={"z-1"}>
            <Button
                variant={"widget"}
                onClick={() => isConnected ? disconnect() : open()}
                disabled={isDisconnecting || isLoading}
                {...connectTooltip}
            >
                {isConnected ? <Unplug size={16}/> : <Plug size={16}/>}
            </Button>
        </WidgetHeader>
        {!isConnected ? (
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
                            <p className={"text-xs text-tertiary truncate"}>{user?.wallet?.addressTypes}</p>
                        )}
                        <CopyButton copyText={user?.wallet?.id ?? ""} className={"bg-0 hover:bg-0 p-0 m-1"} copyIcon={<Copy size={16}/>}/>
                    </div>
                    {user?.addresses?.map((addr, index) => (
                        <div key={index}>
                        <strong>{addr.addressType}:</strong> {addr.address}
                        </div>
                    ))}
                </div>
            </WidgetContent>
        )}
        </>
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
