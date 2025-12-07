"use client"

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {Button} from "@/components/ui/Button"
import React, {useState} from "react"
import {Atlassian, Linear} from "@/components/svg/Icons"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useSession} from "@/hooks/data/useSession"
import {useJira} from "@/hooks/useJira"
import {useLinear} from "@/hooks/useLinear"

export function LinearImportDialog() {
    const {userId} = useSession()
    const {integrations, handleIntegrate} = useIntegrations(userId)
    const atlassianIntegration = getIntegrationByProvider(integrations, "linear")
    const {data} = useLinear()

    const [open, setOpen] = useState(false)

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => setOpen(prev)}
        >
            <DialogTrigger asChild>
                <Button variant={"ghost"} className={"px-2 justify-start w-full gap-2 font-normal hover:text-brand hover:bg-brand/5"}>
                    <Linear width={14} height={14}/>
                    Import from Linear
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-[800px] pl-8 pt-8"}>
                <DialogTitle>Import from Jira</DialogTitle>
                {!atlassianIntegration?.accessToken ? (
                    <Button onClick={() => handleIntegrate("atlassian")}>
                        Connect
                    </Button>
                ) : (
                    <>
                        {data?.flatMap(b => b.project).map(project => (
                            <div>{project}</div>
                        ))}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}