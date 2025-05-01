"use client"

import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import React, { useState } from "react"
import {CloudAlert, Undo2, Workflow} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {Dashboard, User, Widget} from "@/database"
import {useQuery} from "@tanstack/react-query"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Skeleton} from "@/components/ui/Skeleton"
import {useRouter} from "next/navigation"
import {tooltip} from "@/components/ui/TooltipProvider"
import {useWidgetStore} from "@/store/widgetStore"
import {useDashboardStore} from "@/store/dashboardStore"
import {useSessionStore} from "@/store/sessionStore"
import {useToast} from "@/components/ui/ToastProvider"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {cn} from "@/lib/utils"
import Link from "next/link"

function ViewHeader({dashboardId, widgets}: {dashboardId: string, widgets?: Widget[] | null}) {
    const {addWidget} = useWidgetStore()
    const {addDashboard} = useDashboardStore()
    const {session} = useSessionStore()
    const {addToast} = useToast()
    const router = useRouter()
    const [copyDashboardLoading, setCopyDashboardLoading] = useState(false)

    const {data: dashboard, isLoading: dbLoading, isFetching: dbFetching, isError: dbError} = useQuery<Dashboard, Error>({
        queryKey: ["dashboard", dashboardId],
        queryFn: async () => {
            if (!dashboardId) throw new Error("No slug provided")
            const res = await fetch(`/api/dashboards?id=${dashboardId}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json()
            const dash = data[0]
            if (!dash) throw new Error("Dashboard not found")
            return dash
        }
    })

    const {data: user, isLoading: userLoading, isFetching: userFetching, isError: userError} = useQuery<User, Error>({
        queryKey: ["user", dashboard?.userId],
        queryFn: async () => {
            if (!dashboard?.userId) throw new Error("No id provided")
            const res = await fetch(`/api/users?id=${dashboard?.userId}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json()
            return data[0] as User
        },
        enabled: !!dashboard?.userId
    })

    const {data: userDashboards} = useQuery<Dashboard[], Error>({
        queryKey: ["userDashboards", user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error("No id provided")
            const res = await fetch(`/api/dashboards?userId=${user?.id}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json()
            return data as Dashboard[]
        },
        enabled: !!user?.id
    })

    const copyDashboardTooltip = tooltip<HTMLButtonElement>({
        message: "Add this dashboard to your list",
        anchor: "bc",
        offset: 12
    })

    const handleDashboardCopy = async () => {
        try {
            if (!session?.user?.id || !dashboard || !widgets || !userDashboards) return

            const hasDashboardWithName = userDashboards.some((db) => db.name === dashboard.name)
            if (hasDashboardWithName){
                addToast({
                    title: "Error copying dashboard!",
                    subtitle: "You already have an dashboard with the same name.",
                    icon: <Workflow size={24} className={"text-error"}/>
                })
                return
            }

            setCopyDashboardLoading(true)

            const newDashboard: Dashboard = await addDashboard(session.user.id, {
                userId: session.user.id,
                name: dashboard.name,
                isPublic: true,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now())
            })

            const widgetPromises = widgets.map(widget =>
                addWidget(session.user.id, {
                    userId: session.user.id,
                    dashboardId: newDashboard.id,
                    widgetType: widget.widgetType,
                    height: widget.height,
                    width: widget.width,
                    positionX: widget.positionX,
                    positionY: widget.positionY,
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now())
                })
            )

            await Promise.all(widgetPromises)
            router.push("/dashboard")
        } catch (error) {
            addToast({
                title: "An error occurred!",
                subtitle: "Try again later.",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
        } finally {
            setCopyDashboardLoading(false)
        }
    }

    return (
        <div className={"w-full top-0 left-0 h-14 px-8 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <Link href={"/?allowLanding=true"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main"}/>
                <div className={cn("hidden md:flex items-center gap-2 text-sm cursor-default", (dbError || !dashboard || !dashboard.isPublic) && "md:hidden")}>
                    <p className={"text-xs font-mono text-tertiary"}>Dashboard:</p>
                    {dbLoading ?
                        <Skeleton className={"w-12 h-4"}/> :
                        <p className={"text-brand"}>{dashboard?.name}</p>
                    }
                    <p className={"text-tertiary"}>by</p>
                    <div className={"h-6 px-1 flex items-center gap-2 text-sm bg-tertiary rounded-md border border-main/40"}>
                        {userLoading || dbLoading ?
                            <Skeleton className={"size-4 rounded-full"}/> :
                            <Avatar className={"size-4 border border-main/20"}>
                                <AvatarImage src={user?.image ?? undefined} />
                                <AvatarFallback/>
                            </Avatar>
                        }
                        {userLoading || dbLoading ?
                            <Skeleton className={"hidden md:flex h-4 w-12"}/> :
                            <p className={"font-mono"}>{user?.name}</p>
                        }
                    </div>
                </div>
            </div>
            <div className={"flex items-center gap-4"}>
                <Button
                    className={"group gap-2 text-tertiary hover:text-secondary text-sm"}
                    variant={"ghost"}
                    onClick={() => router.push("/dashboard")}
                >
                    <Undo2 size={16}/>
                    <p className={"group-hover:text-primary"}>Go back</p>
                </Button>
                <Button
                    className={"px-1.5"}
                    variant={"brand"}
                    onClick={handleDashboardCopy}
                    disabled={!dashboard || !dashboard.isPublic || userLoading || dbLoading}
                    {...copyDashboardTooltip}
                >
                    {copyDashboardLoading ? <ButtonSpinner/> : <Workflow size={20}/>}
                </Button>
                <ProfilePopover editMode={false}/>
            </div>
        </div>
    )
}

export {ViewHeader}