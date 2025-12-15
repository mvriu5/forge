"use client"

import {useDashboards} from "@/hooks/data/useDashboards"
import {ScrollArea} from "@/components/ui/ScrollArea"
import React, {Suspense} from "react"
import {useSession} from "@/hooks/data/useSession"
import {useSettings} from "@/hooks/data/useSettings"
import {formatDate} from "@/lib/utils"

const LazyDeleteDashboardDialog = React.lazy(() => import('@/components/dialogs/DeleteDashboardDialog'))
const LazyEditDashboardDialog = React.lazy(() => import('@/components/dialogs/EditDashboardDialog'))

function DashboardSection() {
    const {userId} = useSession()
    const {settings} = useSettings(userId)
    const {dashboards = []} = useDashboards(userId, null)

    return (
        <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
            <div className={"flex flex-col gap-4"}>
                {dashboards?.map(dashboard => (
                    <div key={dashboard.id} className={"w-full flex flex-col rounded-md"}>

                        <div className={"flex items-center justify-between gap-2 bg-secondary px-2 py-2 rounded-t-md border-x border-t border-main/40"}>
                            <p className={"text-primary"}>{dashboard.name}</p>
                            <div className={"flex items-center gap-2"}>
                                <Suspense fallback={null}>
                                    <LazyEditDashboardDialog dashboard={dashboard} />
                                </Suspense>
                                <Suspense fallback={null}>
                                    <LazyDeleteDashboardDialog dashboardId={dashboard.id} />
                                </Suspense>
                            </div>
                        </div>
                        <div className={"bg-tertiary px-2 rounded-b-md border border-main/40"}>
                            <p className={"text-xs font-mono text-tertiary py-1"}>
                                {`Created on ${formatDate(dashboard.createdAt, settings?.config?.hourFormat)}`}
                            </p>
                        </div>

                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export {DashboardSection}