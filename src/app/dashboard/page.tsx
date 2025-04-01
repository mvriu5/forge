"use client"

import {Header} from "@/components/Header"
import {ToastProvider, TooltipProvider} from "lunalabs-ui"
import React, {useEffect} from "react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {getWidgetComponent} from "@/lib/widget"
import {useIntegrationStore} from "@/store/integrationStore"

export default function Dashboard() {
    const {session, fetchSession} = useSessionStore()
    const {widgets, getAllWidgets} = useWidgetStore()
    const {fetchIntegrations} = useIntegrationStore()

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    useEffect(() => {
        if (session?.user) {
            getAllWidgets(session.user.id)
            fetchIntegrations(session.user.id)
        }
    }, [session, getAllWidgets, fetchIntegrations])

    return (
        <TooltipProvider>
            <ToastProvider>
                <div className={"flex flex-col w-full h-full"}>
                    <Header />
                    <div className={"w-full h-full grid grid-cols-4 auto-rows-[minmax(180px,180px)] gap-8 p-8"}>
                        {widgets?.map((widget) => {
                            const Component = getWidgetComponent(widget.widgetType)
                            if (!Component) return null
                            return <Component key={widget.widgetType} />
                        })}
                    </div>
                </div>
            </ToastProvider>
        </TooltipProvider>
    )
}