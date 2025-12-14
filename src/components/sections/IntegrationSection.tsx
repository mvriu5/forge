"use client"

import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import React, {useMemo} from "react"
import {Github, Google} from "@/components/svg/Icons"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/Button"
import {Check, X} from "lucide-react"
import {useSession} from "@/hooks/data/useSession"

function IntegrationSection({handleClose}: {handleClose: () => void}) {
    const {userId} = useSession()
    const {integrations, removeIntegration, handleIntegrate} = useIntegrations(userId)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const integrationList = [
        {
            name: "Github",
            icon: Github,
            active: !!githubIntegration,
            onConnect: async () => {
                void handleIntegrate("github", false)
                handleClose()
            },
            onDisconnect: () => removeIntegration("github")
        },
        {
            name: "Google",
            icon: Google,
            active: !!googleIntegration,
            onConnect: async () => {
                void handleIntegrate("google", false)
                handleClose()
            },
            onDisconnect: () => removeIntegration("google")
        }
    ]

    return (
        <div className={"grid grid-cols-2 gap-4"}>
            {integrationList.map((integration) => (
                <div
                    data-state={integration.active ? "active" : "inactive"}
                    key={integration.name}
                    className={cn(
                        "relative group w-full h-20 flex flex-col items-center justify-center rounded-md bg-secondary border p-2 ring-2",
                        "data-[state=active]:border-success/40 data-[state=inactive]:border-error/40",
                        "dark:data-[state=active]:border-success/20 dark:data-[state=inactive]:border-error/20",
                        "data-[state=active]:ring-success/15 data-[state=inactive]:ring-error/15",
                        "dark:data-[state=active]:ring-success/5 dark:data-[state=inactive]:ring-error/5"
                    )}
                >
                    <div className={"flex items-center gap-2 bg-tertiary px-2 py-1 rounded-md"}>
                        <integration.icon className={"size-4 fill-secondary"}/>
                        <p>{integration.name}</p>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                        <Button
                            variant={"ghost"}
                            className={"text-xs text-tertiary font-normal hover:bg-0 hover:underline p-0 font-mono shadow-none"}
                            onClick={() => integration.active ? integration.onDisconnect() : integration.onConnect()}
                        >
                            {integration.active ? "Disconnect" : "Connect"}
                        </Button>
                    </div>
                    <div className={"z-[60] absolute right-1 top-1 text-xs group-data-[state=active]:bg-success/20 group-data-[state=inactive]:bg-error/20 dark:group-data-[state=active]:bg-success/10 dark:group-data-[state=inactive]:bg-error/10 rounded-md p-0.5"}>
                        <p>{integration.active ? <Check size={16} className={"text-success"}/> : <X size={16} className={"text-error"}/>}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export {IntegrationSection}
