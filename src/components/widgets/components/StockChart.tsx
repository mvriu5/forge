"use client"

import React, {memo} from "react"
import {Area, AreaChart, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/Chart"
import {ChartDataPoint} from "@/actions/twelvedata"
import {useTheme} from "next-themes"

interface StockChartProps {
    data: ChartDataPoint[]
    yAxisDomain: number[]
    priceChangePercent: number
    gradientId: string
    chartConfig: ChartConfig
}

const StockChart = memo(function StockChart({data, yAxisDomain, priceChangePercent, gradientId, chartConfig}: StockChartProps) {
    const {theme} = useTheme()
    return (
        <ChartContainer className="max-h-28 h-full w-full" config={chartConfig}>
            <AreaChart data={data} margin={{ top: 5 }}>
                <ChartTooltip
                    cursor={false}
                    labelFormatter={(date: string) => date}
                    content={<ChartTooltipContent />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{
                        overflow: "visible",
                        zIndex: 999,
                        position: "absolute",
                        pointerEvents: "none",
                    }}
                    contentStyle={{ overflow: 'visible' }}
                />
                <XAxis dataKey="date" hide />
                <YAxis domain={yAxisDomain} hide />
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={priceChangePercent >= 0 ? "#398e3d" : "#d33131"}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={priceChangePercent >= 0 ? "#398e3d" : "#d33131"}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <Area
                    type="linear"
                    dataKey="price"
                    stroke={priceChangePercent >= 0 ? "#398e3d" : "#d33131"}
                    fill={`url(#${gradientId})`}
                    fillOpacity={theme === "dark" ? 0.3 : 0.5}
                    strokeWidth={2}
                    dot={false}
                />
            </AreaChart>
        </ChartContainer>
    )
})

export {StockChart}