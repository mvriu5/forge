"use client"

import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {ProfilePopover} from "@/components/popovers/ProfilePopover"
import React from "react"
import {Undo2} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {Dashboard, User} from "@/database"
import {useQuery} from "@tanstack/react-query"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Skeleton} from "@/components/ui/Skeleton"
import {useRouter} from "next/navigation"

function ViewHeader({dashboardId}: {dashboardId: string}) {
    const router = useRouter()

    const {data: dashboard, isLoading: dbLoading, isFetching: dbFetching, isError: dbError} = useQuery<Dashboard, Error>({
        queryKey: ["dashboard", dashboardId],
        queryFn: async () => {
            if (!dashboardId) throw new Error("No slug provided")
            const res = await fetch(`/api/dashboards?id=${dashboardId}`)
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
            const data = await res.json()
            return data[0] as Dashboard
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

    return (
        <div className={"w-full top-0 left-0 h-14 px-8 flex justify-between items-center bg-primary border-b border-main/40"}>
            <div className={"flex items-center gap-4"}>
                <div className={"flex items-center gap-4"}>
                    <ForgeLogo/>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>
                <div className={"h-6 w-px border-r-2 border-main"}/>
                <div className={"hidden md:flex items-center gap-2 text-sm"}>
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
                <ProfilePopover editMode={false}/>
            </div>
        </div>
    )
}

export {ViewHeader}