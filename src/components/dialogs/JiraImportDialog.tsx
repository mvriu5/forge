"use client"

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {Button} from "@/components/ui/Button"
import React, {useState} from "react"
import {Atlassian} from "@/components/svg/Icons"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useSession} from "@/hooks/data/useSession"
import {useJira} from "@/hooks/useJira"

export function JiraImportDialog() {
    const {userId} = useSession()
    const {integrations, handleIntegrate} = useIntegrations(userId)
    const atlassianIntegration = getIntegrationByProvider(integrations, "atlassian")
    const {boards} = useJira()

    const [open, setOpen] = useState(false)

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => setOpen(prev)}
        >
            <DialogTrigger asChild>
                <Button variant={"ghost"} className={"px-2 justify-start w-full gap-2 font-normal hover:text-brand hover:bg-brand/5"}>
                    <Atlassian width={14} height={14}/>
                    Import from Jira
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
                        {boards.map(b => (
                            <div>{b.name}</div>
                        ))}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}