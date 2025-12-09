"use client"

import React from "react"
import {WidgetHeader} from "./base/WidgetHeader"
import {useGithubHeatmap} from "@/hooks/useGithubHeatmap"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {Heatmap} from "@/components/ui/Heatmap"
import {Skeleton} from "@/components/ui/Skeleton"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {useBreakpoint} from "@/hooks/media/useBreakpoint"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {defineWidget, WidgetProps } from "@forge/sdk"

const GithubHeatmapWidget: React.FC<WidgetProps> = ({widget, integration}) => {
    const {integrations, handleIntegrate} = useIntegrations(widget.userId)
    const githubIntegration = getIntegrationByProvider(integrations, integration)
    const {data, isLoading, isFetching} = useGithubHeatmap()
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

    const hasError = !githubIntegration?.accessToken && !isLoading

    return (
        <>
            {hasError ? (
                <WidgetError
                    message={"Please integrate your Github account to view your heatmap."}
                    actionLabel={"Integrate Github"}
                    onAction={() => handleIntegrate("github")}
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
                                    // biome-ignore lint/suspicious/noArrayIndexKey
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
        </>
    )
}

export const githubheatmapWidgetDefinition = defineWidget({
    name: "Github Heatmap",
    integration: "github",
    component: GithubHeatmapWidget,
    preview: {
        description: "Show off your commit streak.",
        image: "/github_preview.svg",
        tags: ["github"],
        sizes: {
            desktop: { width: 2, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 }
        }
    },
})

