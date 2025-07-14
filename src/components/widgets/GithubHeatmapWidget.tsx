"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import { WidgetHeader } from "./base/WidgetHeader"
import { useGithubHeatmap } from "@/hooks/useGithubHeatmap"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import CalendarHeatmap, {ReactCalendarHeatmapValue, TooltipDataAttrs} from "react-calendar-heatmap"
import {Skeleton} from "@/components/ui/Skeleton"

const GithubHeatmapWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {}

    const {data, isLoading, isFetching, isError} = useGithubHeatmap()



    const classForValue = (value: any) => {
        if (!value || value.count === 0) return "color-empty"
        if (value.count < 5) return "color-scale-1"
        if (value.count < 10) return "color-scale-2"
        if (value.count < 15) return "color-scale-3"
        return "color-scale-4"
    }

    const tooltipDataAttrs = (value: ReactCalendarHeatmapValue<string> | undefined): TooltipDataAttrs => {
        if (!value || !value.date) return {}

        const date = new Date(value.date)
        const formattedDate = date.toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })

        return {
            "data-tip": `${value.count} Beiträge am ${formattedDate}`,
        } as TooltipDataAttrs
    }

    if (isLoading) {
        return (
            <WidgetTemplate id={id} className="col-span-1 row-span-1" name={"github-heatmap"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetHeader>
                    <Skeleton className={"w-20 h-8"}/>
                </WidgetHeader>
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate id={id} className="col-span-1 row-span-1" name={"github-heatmap"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Github Heatmap"}/>
            <WidgetContent className={"h-full"}>
                <style jsx>{`
                    :global(.react-calendar-heatmap .text) { 
                        justify-content: space-between; 
                    }
                    :global(.react-calendar-heatmap .color-empty) { fill: #ebedf0; }
                    :global(.react-calendar-heatmap .color-scale-1) { fill: #9be9a8; }
                    :global(.react-calendar-heatmap .color-scale-2) { fill: #40c463; }
                    :global(.react-calendar-heatmap .color-scale-3) { fill: #30a14e; }
                    :global(.react-calendar-heatmap .color-scale-4) { fill: #216e39; }
                    :global(.dark .react-calendar-heatmap .color-empty) { fill: #161b22; }
                    :global(.dark .react-calendar-heatmap .color-scale-1) { fill: #0e4429; }
                    :global(.dark .react-calendar-heatmap .color-scale-2) { fill: #006d32; }
                    :global(.dark .react-calendar-heatmap .color-scale-3) { fill: #26a641; }
                    :global(.dark .react-calendar-heatmap .color-scale-4) { fill: #39d353; }
                    :global(.react-calendar-heatmap-month-label),
                    :global(.react-calendar-heatmap-weekday-label) {
                        font-size: 12px;
                        fill: #656d76;
                    }
                    :global(.dark .react-calendar-heatmap-month-label),
                    :global(.dark .react-calendar-heatmap-weekday-label) {
                        fill: #7d8590;
                    }
                `}</style>
                <CalendarHeatmap
                    startDate={new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())}
                    endDate={new Date()}
                    values={data!.map((contrib) => ({
                        date: contrib.date,
                        count: contrib.count,
                    }))}
                    classForValue={classForValue}
                    tooltipDataAttrs={tooltipDataAttrs}
                    showWeekdayLabels={true}
                    showMonthLabels={true}
                    weekdayLabels={["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]}
                    monthLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                />
            </WidgetContent>
        </WidgetTemplate>
    )
}

export { GithubHeatmapWidget }

