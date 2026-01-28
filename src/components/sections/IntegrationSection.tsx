"use client"

import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import React, {useCallback, useMemo} from "react"
import {Github, Google, Notion} from "@/components/svg/Icons"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/Button"
import {Check, X} from "lucide-react"
import { toast } from "@/components/ui/Toast"
import { authClient } from "@/lib/auth-client"

function IntegrationSection({handleClose}: {handleClose: () => void}) {
    const {data: session} = authClient.useSession()
    const {integrations, removeIntegration, handleIntegrate} = useIntegrations(session?.user.id)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])
    const notionIntegration = useMemo(() => getIntegrationByProvider(integrations, "notion"), [integrations])

    const handleConnect = useCallback(async (provider: string) => {
        handleIntegrate(provider, false)
        handleClose()
    }, [])

    const handleDisconnect = useCallback((provider: string) => {
        removeIntegration(provider)
        handleClose()
        toast.success("Successfully disconnected the integration!")
    }, [])

    const integrationList = [
        { name: "Github", icon: Github, active: !!githubIntegration },
        { name: "Google", icon: Google, active: !!googleIntegration },
        { name: "Notion", icon: Notion, active: !!notionIntegration }
    ]

    return (
        <div className={"flex flex-col gap-4"}>
            {integrationList.map((integration) => (
                <div
                    data-state={integration.active ? "active" : "inactive"}
                    key={integration.name}
                    className={cn(
                        "relative group w-full flex items-center justify-between rounded-md bg-secondary border p-2 ring-2",
                        "data-[state=active]:border-success/40 data-[state=inactive]:border-error/40",
                        "dark:data-[state=active]:border-success/20 dark:data-[state=inactive]:border-error/20",
                        "data-[state=active]:ring-success/15 data-[state=inactive]:ring-error/15",
                        "dark:data-[state=active]:ring-success/5 dark:data-[state=inactive]:ring-error/5"
                    )}
                >
                    <div className={"flex items-center gap-2"}>
                        <div className={"text-xs group-data-[state=active]:bg-success/20 group-data-[state=inactive]:bg-error/20 dark:group-data-[state=active]:bg-success/10 dark:group-data-[state=inactive]:bg-error/10 rounded-md p-0.5"}>
                            <p>{integration.active ? <Check size={18} className={"text-success"}/> : <X size={18} className={"text-error"}/>}</p>
                        </div>
                        <div className={"flex items-center gap-2"}>
                            <integration.icon className={"size-4 fill-secondary"}/>
                            <p>{integration.name}</p>
                        </div>
                    </div>

                    <Button
                        variant={"ghost"}
                        className={"text-xs text-tertiary font-normal font-mono shadow-none p-1"}
                        onClick={() => integration.active ? handleDisconnect(integration.name.toLowerCase()) : handleConnect(integration.name.toLowerCase())}
                    >
                        {integration.active ? "Disconnect" : "Connect"}
                    </Button>
                </div>
            ))}
        </div>
    )
}

export {IntegrationSection}
