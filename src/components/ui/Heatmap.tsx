"use client"

import {cn} from "@/lib/utils"
import {useMemo} from "react"
import {useTooltip} from "@/components/ui/TooltipProvider"

interface HeatmapProps {
    data: { date: string, count: number }[] | undefined
    startDate?: string
    endDate?: string
    cellSize?: number
    gap?: number
    className?: string
}

function Heatmap({data, startDate, endDate, cellSize = 12, gap = 2, className}: HeatmapProps) {
    const gridData = useMemo(() => {
        let start: Date
        let end: Date

        if (startDate && endDate) {
            start = new Date(startDate)
            end = new Date(endDate)
        } else if (data && data?.length > 0) {
            const dates = data?.map((d) => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime())
            start = dates[0]
            end = dates[dates.length - 1]
        } else {
            end = new Date()
            start = new Date()
            start.setFullYear(start.getFullYear() - 1)
        }

        const dataMap = new Map<string, number>()
        data?.map((item) => dataMap.set(item.date, item.count))

        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const weeks = Math.ceil(totalDays / 7)

        const firstSunday = new Date(start)
        firstSunday.setDate(start.getDate() - start.getDay())

        const grid: Array<Array<{ date: string, value: number}>> = []

        for (let week = 0; week < weeks; week++) {
            const weekData: Array<{ date: string, value: number, label?: string }> = []

            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(firstSunday)
                currentDate.setDate(firstSunday.getDate() + week * 7 + day)

                const dateString = currentDate.toISOString().split("T")[0]
                const cellData = dataMap.get(dateString)

                weekData.push({
                    date: dateString,
                    value: cellData ?? 0
                })
            }
            grid.push(weekData)
        }

        const monthLabels: Array<{ label: string; span: number; offset: number }> = []
        let currentMonth = -1
        let monthStart = 0
        let monthWeeks = 0

        for (let week = 0; week < weeks; week++) {
            const weekStart = new Date(firstSunday)
            weekStart.setDate(firstSunday.getDate() + week * 7)
            const month = weekStart.getMonth()

            if (month !== currentMonth) {
                if (currentMonth !== -1 && monthWeeks > 0) {
                    monthLabels.push({
                        label: new Date(2024, currentMonth).toLocaleDateString("en", { month: "short" }),
                        span: monthWeeks,
                        offset: monthStart,
                    })
                }

                currentMonth = month
                monthStart = week
                monthWeeks = 1
            } else {
                monthWeeks++
            }
        }

        if (currentMonth !== -1 && monthWeeks > 0) {
            monthLabels.push({
                label: new Date(2024, currentMonth).toLocaleDateString("en", { month: "short" }),
                span: monthWeeks,
                offset: monthStart
            })
        }

        return { grid, monthLabels, weeks }
    }, [data, startDate, endDate])

    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 1
        return Math.max(...data.map((item) => item.count), 1)
    }, [data])

    const getIntensity = (value: number) => {
        if (value === 0) return 0
        return Math.min(Math.ceil((value / maxValue) * 5), 5)
    }

    const getTooltip = (cell: {date: string, value: number}) => {
         return useTooltip<HTMLDivElement>({
            message: `${cell.value} commits on ${new Date(cell.date).toLocaleDateString("en")}`,
            anchor: "tc",
        })
    }

    return (
        <div className={cn("relative", className)}>
            <div className="flex">
                <div>
                    {/* Month Labels */}
                    <div className="flex mb-2">
                        {gridData.monthLabels.map((month, index) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={index}
                                className="text-xs text-tertiary flex items-center justify-center absolute"
                                style={{
                                    left: month.offset * (cellSize + gap),
                                    width: month.span * (cellSize + gap) - gap,
                                }}
                            >
                                {month.label}
                            </div>
                        ))}
                        {/* Spacer für die Höhe */}
                        <div className={"h-4 w-full"} />
                    </div>

                    {/* Heatmap Grid */}
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: `repeat(${gridData.weeks}, ${cellSize}px)`,
                            gridTemplateRows: `repeat(7, ${cellSize}px)`,
                            gap: `${gap}px`,
                        }}
                    >
                        {Array.from({ length: 7 }, (_, day) =>
                            Array.from({ length: gridData.weeks }, (_, week) => {
                                const cell = gridData.grid[week]?.[day]
                                if (!cell) return null

                                const intensity = getIntensity(cell.value)

                                return (
                                    <div
                                        key={cell.date}
                                        {...getTooltip(cell)}
                                        className={cn(
                                            "rounded-xs bg-gray-400",
                                            intensity === 0 && "bg-white/30 dark:bg-white/10",
                                            intensity === 1 && "bg-green-400 dark:bg-green-300",
                                            intensity === 2 && "bg-green-500",
                                            intensity === 3 && "bg-green-700",
                                            intensity === 4 && "bg-green-800",
                                            intensity === 5 && "bg-green-900",

                                        )}
                                        style={{
                                            width: cellSize,
                                            height: cellSize,
                                            gridColumn: week + 1,
                                            gridRow: day + 1,
                                        }}
                                    />
                                )
                            }),
                        ).flat()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export {Heatmap}