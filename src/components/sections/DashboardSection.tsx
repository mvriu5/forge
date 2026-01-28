"use client"

import {useDashboards} from "@/hooks/data/useDashboards"
import {ScrollArea} from "@/components/ui/ScrollArea"
import React, {Suspense} from "react"
import {useSettings} from "@/hooks/data/useSettings"
import {formatDate} from "@/lib/utils"
import {Pencil, Trash} from "lucide-react"
import {Button} from "@/components/ui/Button"
import { authClient } from "@/lib/auth-client"

const LazyDeleteDashboardDialog = React.lazy(() => import('@/components/dialogs/DeleteDashboardDialog'))
const LazyEditDashboardDialog = React.lazy(() => import('@/components/dialogs/EditDashboardDialog'))

function DashboardSection({handleClose}: {handleClose?: () => void}) {
    const {data: session} = authClient.useSession()
    const {settings} = useSettings(session?.user.id)
    const {dashboards = []} = useDashboards(session?.user.id, null)

    return (
        <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
            <div className={"flex flex-col gap-4"}>
                {dashboards?.map(dashboard => (
                    <div key={dashboard.id} className={"w-full flex flex-col rounded-md"}>

                        <div className={"flex items-center justify-between gap-2 bg-secondary px-2 py-2 rounded-t-md border-x border-t border-main/40"}>
                            <p className={"text-primary"}>{dashboard.name}</p>
                            <div className={"flex items-center gap-2"}>
                                <Suspense
                                    fallback={
                                        <Button type={"button"} className={"px-1.5 gap-1.5 text-sm"}>
                                            <Pencil size={14}/>
                                            Edit
                                        </Button>
                                    }
                                >
                                    <LazyEditDashboardDialog dashboard={dashboard} />
                                </Suspense>
                                <Suspense
                                    fallback={
                                        <Button type={"button"} className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error"}>
                                            <Trash size={16}/>
                                        </Button>
                                    }
                                >
                                    <LazyDeleteDashboardDialog
                                        dashboard={dashboard}
                                        onDelete={handleClose}
                                        onAllDeleted={handleClose}
                                    />
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
