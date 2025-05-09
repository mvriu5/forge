"use client"

import {Callout} from "@/components/ui/Callout"
import React, {useEffect} from "react"
import {getWidgetComponent} from "@/lib/widgetRegistry"
import {Dashboard, Widget} from "@/database"
import {useQuery} from "@tanstack/react-query"
import {useParams} from "next/navigation"
import {ViewHeader} from "@/components/ViewHeader"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {ShieldCheck} from "lucide-react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import {useDashboardStore} from "@/store/dashboardStore"

export default function SharedDashboard() {
    const { slug } = useParams()
    const { fetchSession } = useSessionStore()

    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    const {data: dashboard, isLoading: dashLoading, isError: dashError} = useQuery<Dashboard, Error>({
        queryKey: ["dashboard", slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided")
            const res = await fetch(`/api/dashboards?id=${slug}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json() as Dashboard[]
            const dash = data[0]
            if (!dash) throw new Error("Dashboard not found")
            return dash
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    const {data, isLoading, isFetching, isError} = useQuery<Widget[], Error>({
        queryKey: ["widgets", slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided")
            const res = await fetch(`/api/widgets?dashboardId=${slug}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json()
            useWidgetStore.setState({ widgets: data })
            return data as Widget[]
        },
        enabled: !!dashboard?.isPublic,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    if (isLoading || dashLoading) {
        return (
            <div className={"flex flex-col w-screen h-screen"}>
                <ViewHeader dashboardId={slug as string}/>
                <div className={"h-full w-full flex items-center justify-center"}>
                    <ButtonSpinner/>
                </div>
            </div>
        )
    }

    if (dashError || !dashboard || !dashboard.isPublic) {
        return (
            <div className="flex flex-col w-screen h-screen">
                <ViewHeader dashboardId={slug as string} />
                <div className="h-full w-full flex items-center justify-center">
                    <Callout variant="info" className={"flex items-center gap-2 border border-info/20"}>
                        <ShieldCheck size={18}/>
                        This dashboard is private.
                    </Callout>
                </div>
            </div>
        )
    }

    return (
        <div className={"flex flex-col w-full h-full max-h-screen max-w-screen overflow-hidden"}>
            <ViewHeader dashboardId={slug as string} widgets={data ?? null}/>
            <div className={"flex h-screen xl:hidden items-center justify-center"}>
                <Callout variant={"info"} className={"border border-info/20 shadow-lg"}>
                    The browser window is to small to render these widgets!
                </Callout>
            </div>
            <div
                className="w-full h-[calc(100vh-64px)] hidden xl:grid grid-cols-4 gap-8 p-8"
                style={{ gridTemplateRows: "repeat(4, minmax(0, 1fr))" }}
            >
                {data?.map((widget: Widget) => {
                    const Component = getWidgetComponent(widget.widgetType)
                    if (!Component) return null
                    return <Component key={widget.id} id={widget.id} editMode={false} isPlaceholder={true}/>
                })}
            </div>
        </div>
    )
}