"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import { WidgetHeader } from "./base/WidgetHeader"
import { useGithubHeatmap } from "@/hooks/useGithubHeatmap"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import {Heatmap} from "@/components/ui/Heatmap"
import {Skeleton} from "@/components/ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {useIntegrationStore} from "@/store/integrationStore"
import {authClient} from "@/lib/auth-client"
import {Blocks, CloudAlert} from "lucide-react"
import {useToast} from "@/components/ui/ToastProvider"

const GithubHeatmapWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        return (
            <WidgetTemplate id={id} className="col-span-2 row-span-1" name={"github-heatmap"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder>
                <WidgetHeader title={"Github Heatmap"}/>
                <WidgetContent className={"h-full items-center"}>
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
                            <div key={i} className={"bg-green-500 size-2.5 rounded-xs"}/>
                        )}
                    </div>
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const {data, isLoading, isFetching, isError} = useGithubHeatmap()
    const {githubIntegration} = useIntegrationStore()
    const {addToast} = useToast()

    const contributions = data?.map(({ date, count }) => ({ date, count }))

    const handleIntegrate = async () => {
        const data = await authClient.signIn.social({provider: "github", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
                addToast({
                    title: "Successfully integrated Github",
                    icon: <Blocks size={24}/>
                })
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
            }
        })
    }

    if (!githubIntegration?.accessToken && !isLoading) {
        return (
            <WidgetTemplate id={id} className="col-span-2 row-span-1" name={"github"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Github account first!"}
                    actionLabel={"Integrate"}
                    onAction={handleIntegrate}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate id={id} className="col-span-2 row-span-1" name={"github-heatmap"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                        cellSize={10}
                        gap={2}
                    />
                )}
            </WidgetContent>
        </WidgetTemplate>
    )
}

export { GithubHeatmapWidget }

