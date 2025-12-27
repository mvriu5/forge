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
import {defineWidget, WidgetProps } from "@tryforgeio/sdk"

const SKELETON_COUNT = 371
const skeletonKeys = Array.from({ length: SKELETON_COUNT }, (_, i) => `sk-${i}`)

const GithubHeatmapWidget: React.FC<WidgetProps> = () => {
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

    return (
        <>
            <WidgetContent className={"h-full flex justify-center items-center"}>
                {(isLoading || isFetching) ? (
                    <div
                        className="grid mt-6"
                        style={{
                            gridTemplateColumns: "repeat(53, 10px)",
                            gridTemplateRows: "repeat(7, 10px)",
                            gap: "2px",
                        }}
                    >
                        {skeletonKeys.map((key) => (
                            <Skeleton key={key} className={"size-2.5 rounded-xs"}/>
                        ))}
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
    )
}

export const githubheatmapWidgetDefinition = defineWidget({
    name: "Github Heatmap",
    integration: "github",
    component: GithubHeatmapWidget,
    description: "Show off your commit streak.",
    image: "/githubheatmap_preview.svg",
    tags: ["github"],
    sizes: {
        desktop: { width: 2, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    }
})
