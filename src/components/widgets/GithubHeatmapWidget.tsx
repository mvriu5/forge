"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import { WidgetHeader } from "./base/WidgetHeader"
import { useGithubHeatmap } from "@/hooks/useGithubHeatmap"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import {Heatmap} from "@/components/ui/Heatmap"
import {Skeleton} from "@/components/ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {authClient} from "@/lib/auth-client"
import {Blocks, CloudAlert} from "lucide-react"
import {useBreakpoint} from "@/hooks/media/useBreakpoint"
import { useSession } from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {toast} from "sonner"

const GithubHeatmapWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {userId} = useSession()
    const {integrations, refetchIntegrations} = useIntegrations(userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")
    const {data, isLoading, isFetching, isError} = useGithubHeatmap()
    const {tailwindBreakpoint} = useBreakpoint()

    const cellSize = {
        "2xl": 10,
        xl: 8,
        lg: 7,
        md: 4,
        sm: 6,
        xs: 5
    }

    const contributions = data?.map(({ date, count }) => ({ date, count }))

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({provider: "github", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
                void refetchIntegrations()
            },
            onSuccess: (ctx) => {
                toast.success("Successfully integrated Github", {icon: <Blocks size={24}/>})
            },
            onError: (ctx) => {
                toast.error("Something went wrong", {description: ctx.error.message})
            }
        })
    }

    const hasError = !githubIntegration?.accessToken && !isLoading

    return (
        <WidgetTemplate id={id} widget={widget} name={"github-heatmap"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            {hasError ? (
                <WidgetError
                    message={"Please integrate your Github account to view your heatmap."}
                    actionLabel={"Integrate Github"}
                    onAction={handleIntegrate}
                />
            ) : (
                <>
                    <WidgetHeader title={"Github Heatmap"}/>
                    <WidgetContent className={"h-full items-center"}>
                        {(isLoading || isFetching) ? (
                            <div
                                className="grid mt-6"
                                style={{
                                    gridTemplateColumns: "repeat(53, 10px)",
                                    gridTemplateRows: "repeat(7, 10px)",
                                    gap: "2px",
                                }}
                            >
                                {Array.from({ length: 371 }, (_, i) =>
                                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                    <Skeleton key={i} className={"size-2.5 rounded-xs"}/>
                                )}
                            </div>
                        ) : (
                            <Heatmap
                                data={contributions}
                                cellSize={cellSize[tailwindBreakpoint]}
                                gap={2}
                            />
                        )}
                    </WidgetContent>
                </>
            )}
        </WidgetTemplate>
    )
}

export { GithubHeatmapWidget }

