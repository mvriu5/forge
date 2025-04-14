"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {TrendingDown, TrendingUp} from "lucide-react"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/Chart"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {Skeleton} from "@/components/ui/Skeleton"
import {Area, AreaChart, YAxis} from "recharts"
import {cn} from "@/lib/utils"
import {useStock} from "@/hooks/useStock"

const StockSmallWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {
        assetData,
        loading,
        stock,
        setStock,
        timespan,
        setTimespan,
        yAxisDomain,
        assetOptions
    } = useStock()

    const chartConfig = {
        price: {
            label: "Price"
        }
    } satisfies ChartConfig

    return (
        <WidgetTemplate className="col-span-1 row-span-1" name={"stockSmall"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className={"flex flex-col gap-2 h-full"}>

                <div className={"flex items-center justify-between gap-4"}>
                    <div className={"flex items-center gap-2"}>
                        <Select value={stock} onValueChange={setStock}>
                            <SelectTrigger className={" border-0 bg-0 px-0 gap-2 justify-normal text-primary text-lg font-semibold"}>
                                <SelectValue placeholder="Stock" className={"text-lg font-semibold text-primary"}/>
                            </SelectTrigger>
                            <SelectContent align={"start"} className={"border-main/40"}>
                                {assetOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label} ({option.value})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className={"flex items-center gap-2"}>
                        {loading || Number.isNaN(assetData?.currentPrice ?? 0) || assetData?.currentPrice === undefined ?
                            <Skeleton className="h-6 w-12"/> :
                            <div className={"text-primary text-md text-semibold"}>{`$${Number(assetData?.currentPrice?.toFixed(2))}`}</div>
                        }
                        <Select value={timespan} onValueChange={setTimespan}>
                            <SelectTrigger className={"w-[100px] border-main/60"}>
                                <SelectValue placeholder="Timespan"/>
                            </SelectTrigger>
                            <SelectContent align={"end"} className={"border-main/40"}>
                                <SelectItem value="1">24 hours</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!assetData?.chartData &&
                    <div className={"flex items-center justify-center h-full w-full"}>
                        <p className={"text-sm text-error"}>Error loading data</p>
                    </div>
                }
                <div className={cn("relative h-max bg-secondary rounded-md overflow-hidden", !assetData?.chartData && "hidden")}>
                    <div
                        className={cn(
                            "absolute bottom-1 left-1 flex items-center gap-1 px-2 py-0.5 bg-white/2 rounded-md shadow-xl w-max h-max",
                            assetData?.priceChangePercent! >= 0 ? "text-success" : "text-error"
                        )}
                    >
                        {assetData?.priceChangePercent! >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                        {`${Number(assetData?.priceChangePercent.toFixed(2))}%`}
                    </div>

                    <ChartContainer config={chartConfig} className={"max-h-[108px] w-full"}>
                        <AreaChart
                            accessibilityLayer
                            data={assetData?.chartData}
                            margin={{
                                top: 5,
                            }}
                        >
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        hideLabel
                                        className={"z-50"}
                                    />
                                }
                            />
                            <YAxis
                                domain={yAxisDomain}
                                hide={true}
                            />
                            <Area
                                dataKey="price"
                                type="linear"
                                stroke={assetData?.priceChangePercent! >= 0 ? "#398e3d" : "#d33131"}
                                fill="url(#fillArea)"
                                fillOpacity={0.3}
                                strokeWidth={2}
                                dot={false}
                            />
                            <defs>
                                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={assetData?.priceChangePercent! >= 0 ? "#398e3d" : "#d33131"}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={assetData?.priceChangePercent! >= 0 ? "#398e3d" : "#d33131"}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ChartContainer>
                </div>
            </div>
        </WidgetTemplate>
    )
}
export { StockSmallWidget }