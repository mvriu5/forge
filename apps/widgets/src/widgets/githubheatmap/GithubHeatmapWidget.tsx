"use client"

import React from "react"
import { WidgetHeader } from "../base/WidgetHeader"
import {useBreakpoint} from "@forge/ui/hooks/useBreakpoint"
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import { WidgetError } from "../base/WidgetError"
import {WidgetContent} from "../base/WidgetContent"
import { Skeleton } from "@forge/ui/components/Skeleton"
import {Heatmap} from "@forge/ui/components/Heatmap"

type GithubReturnType = {
    data: any
    isLoading: boolean
    isFetching: boolean
    isError: boolean
}

interface GithubHeatmapWidgetProps extends WidgetProps {
    hook: GithubReturnType
    onIntegrate: () => void
    githubIntegration: any
}

const GithubHeatmapWidget: React.FC<GithubHeatmapWidgetProps> = ({widget, editMode, onWidgetDelete, hook, onIntegrate, githubIntegration}) => {
    const {tailwindBreakpoint} = useBreakpoint()

    const cellSize = {
        "2xl": 10,
        xl: 8,
        lg: 7,
        md: 4,
        sm: 6,
        xs: 5
    }

    if (!githubIntegration?.accessToken && !hook.isLoading) {
        return (
            <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError
                    message={"If you want to use this widget, you need to integrate your Github account first!"}
                    actionLabel={"Integrate"}
                    onAction={onIntegrate() ?? undefined}
                />
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Github Heatmap"}/>
            <WidgetContent className={"h-full items-center"}>
                {(hook.isLoading || hook.isFetching) ? (
                    <div
                        className="grid mt-6"
                        style={{
                            gridTemplateColumns: "repeat(53, 10px)",
                            gridTemplateRows: "repeat(7, 10px)",
                            gap: "2px",
                        }}
                    >
                        {Array.from({ length: 371 }, (_, i) =>
                            <Skeleton key={i} className={"size-2.5 rounded-xs"}/>
                        )}
                    </div>
                ) : (
                    <Heatmap
                        data={hook.data}
                        cellSize={cellSize[tailwindBreakpoint]}
                        gap={2}
                    />
                )}
            </WidgetContent>
        </WidgetTemplate>
    )
}

export { GithubHeatmapWidget }

