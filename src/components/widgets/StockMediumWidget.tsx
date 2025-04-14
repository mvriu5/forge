"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {useStock} from "@/hooks/useStock"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/Chart"
import {Area, AreaChart, YAxis} from "recharts"
import {cn} from "@/lib/utils"
import {TrendingDown, TrendingUp} from "lucide-react"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {StockSelect} from "@/components/widgets/components/StockSelect"

const StockMediumWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {

    return (
        <WidgetTemplate className={"col-span-1 row-span-2"} name={"stockMedium"} editMode={editMode} onWidgetDelete={onWidgetDelete}>

            <div className={"h-full flex flex-col gap-2"}>

                <div className={"flex items-center gap-2"}>
                    <p className={"text-lg text-primary font-semibold"}>Stock Overview</p>
                    <StockSelect/>
                </div>

                <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
                    <div className={"flex flex-col gap-2"}>
                        <Stock selectedStock={"AAPL"} selectedTimespan={"365"}/>
                        <Stock selectedStock={"MSFT"} selectedTimespan={"365"}/>
                        <Stock selectedStock={"BTC/USD"} selectedTimespan={"365"}/>
                        <Stock selectedStock={"SOL/USD"} selectedTimespan={"365"}/>
                    </div>
                </ScrollArea>
            </div>

        </WidgetTemplate>
    )
}

interface StockProps {
    selectedStock: string
    selectedTimespan: string
}

const Stock = ({selectedStock, selectedTimespan}: StockProps) => {
    const {
        assetData,
        loading,
        stock,
        setStock,
        timespan,
        setTimespan,
        yAxisDomain,
        assetOptions
    } = useStock(selectedStock, selectedTimespan)

    const chartConfig = {
        price: {
            label: "Price"
        }
    } satisfies ChartConfig

    return (
        <div className="relative flex items-center gap-2 bg-secondary rounded-md py-2 shadow-md">
            <div className={"flex flex-col items-center gap-2 px-2"}>
                <div className={"w-full flex flex-col items-center gap-2 p-1 rounded-md border border-main/20"}>
                    <p className={"text-primary font-semibold"}>{stock}</p>
                    <p className={"text-secondary"}>{`$${Number(assetData?.currentPrice?.toFixed(2))}`}</p>
                </div>

                <div
                    className={cn(
                        "flex items-center gap-1 px-2 py-0.5 bg-gradient-to-b from-white/2 rounded-md shadow-xl w-max h-max",
                        assetData?.priceChangePercent! >= 0 ? "text-success to-success/10" : "text-error to-error/10"
                    )}
                >
                    {assetData?.priceChangePercent! >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                    {`${Number(assetData?.priceChangePercent.toFixed(2))}%`}
                </div>

            </div>
            <ChartContainer config={chartConfig} className={"max-h-[100px] w-full"}>
                <AreaChart
                    accessibilityLayer
                    data={assetData?.chartData}
                    margin={{
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
                        fill={`url(#fillArea-${selectedStock})`}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={false}
                    />
                    <defs>
                        <linearGradient id={`fillArea-${selectedStock}`} x1="0" y1="0" x2="0" y2="1">
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
    )
}


export {StockMediumWidget}