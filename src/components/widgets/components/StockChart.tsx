import React, {memo} from "react"
import {Area, AreaChart, YAxis} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/Chart"
import { ChartDataPoint } from "@/actions/twelvedata"

interface StockChartProps {
    data: ChartDataPoint[]
    yAxisDomain: number[]
    priceChangePercent: number
    gradientId: string
    chartConfig: ChartConfig
}

const StockChart = memo(function StockChart({data, yAxisDomain, priceChangePercent, gradientId, chartConfig}: StockChartProps) {
    return (
        <ChartContainer className="max-h-[108px] w-full" config={chartConfig}>
            <AreaChart data={data} margin={{ top: 5 }}>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
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
                    fillOpacity={0.3}
                    strokeWidth={2}
                    dot={false}
                />
            </AreaChart>
        </ChartContainer>
    )
})

export {StockChart}