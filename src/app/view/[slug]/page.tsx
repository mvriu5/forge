"use client"

import {Callout} from "@/components/ui/Callout"
import React, {useEffect} from "react"
import {getWidgetComponent, getWidgetPreview} from "@/lib/widgetRegistry"
import {Dashboard, Widget} from "@/database"
import {useQuery} from "@tanstack/react-query"
import {useParams} from "next/navigation"
import {ViewHeader} from "@/components/ViewHeader"
import {ShieldCheck} from "lucide-react"
import {useSessionStore} from "@/store/sessionStore"
import {useWidgetStore} from "@/store/widgetStore"
import { cn } from "@/lib/utils"
import {useResponsiveLayout} from "@/hooks/useResponsiveLayout"
import {useBreakpoint} from "@/hooks/useBreakpoint"
import {Spinner} from "@/components/ui/Spinner"
import {SpinnerDotted} from "spinners-react"

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
    if (!data) return

    const { transformedWidgets, gridClasses, containerHeight, isDesktop } = useResponsiveLayout(data)

    if (isLoading || dashLoading) {
        return (
            <div className={"flex flex-col w-screen h-screen"}>
                <ViewHeader dashboardId={slug as string}/>
                <div className={"h-full w-full flex items-center justify-center"}>
                    <SpinnerDotted size={56} thickness={160} speed={100} color="rgba(237, 102, 49, 1)" />
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
        <div className={cn("flex flex-col w-full h-full overflow-hidden", isDesktop && "max-h-screen max-w-screen")}>
            <ViewHeader dashboardId={slug as string} widgets={data ?? null}/>
            <div className={cn("relative w-full", containerHeight, gridClasses)}>
                {transformedWidgets?.map((widget: Widget) => {
                    const {breakpoint} = useBreakpoint()

                    const Component = getWidgetComponent(widget.widgetType)
                    if (!Component) return null

                    const widgetPreview = getWidgetPreview(widget.widgetType)
                    if (!widgetPreview) return null

                    const responsiveSize = widgetPreview.preview.sizes[breakpoint]

                    return (
                        <div
                            key={widget.id}
                            style={{
                                gridColumnStart: widget.positionX + 1,
                                gridRowStart: widget.positionY + 1,
                                gridColumnEnd: widget.positionX + 1 + responsiveSize.width,
                                gridRowEnd: widget.positionY + 1 + responsiveSize.height,
                            }}
                        >
                            <Component id={widget.id} editMode={false} isPlaceholder={true}/>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}