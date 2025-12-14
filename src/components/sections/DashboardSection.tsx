"use client"

import {useDashboards} from "@/hooks/data/useDashboards"
import {ScrollArea} from "@/components/ui/ScrollArea"
import React, {Suspense} from "react"
import {useSession} from "@/hooks/data/useSession"

const LazyDeleteDashboardDialog = React.lazy(() => import('@/components/dialogs/DeleteDashboardDialog'))
const LazyEditDashboardDialog = React.lazy(() => import('@/components/dialogs/EditDashboardDialog'))

function DashboardSection() {
    const {userId} = useSession()
    const {dashboards = []} = useDashboards(userId, null)

    return (
        <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
            <div className={"flex flex-col gap-4"}>
                {dashboards?.map(dashboard => (
                    <div key={dashboard.id} className={"w-full flex items-center justify-between gap-2 bg-tertiary border border-main/20 rounded-md py-2 px-4"}>
                        <p className={"text-primary"}>{dashboard.name}</p>
                        <div className={"flex items-center"}>
                            <Suspense fallback={null}>
                                <LazyDeleteDashboardDialog dashboardId={dashboard.id} />
                            </Suspense>
                            <Suspense fallback={null}>
                                <LazyEditDashboardDialog dashboard={dashboard} />
                            </Suspense>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export {DashboardSection}