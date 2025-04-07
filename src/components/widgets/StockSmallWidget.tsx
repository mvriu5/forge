"use client"

import type React from "react"
import {useState} from "react"
import {WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {Bitcoin, ChartCandlestick, ChartSpline, TrendingDown, TrendingUp} from "lucide-react"
import {
    Badge,
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    Tabs,
    TabsList,
    TabsTrigger
} from "lunalabs-ui"
import {CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis } from "recharts"

interface StockSmallWidgetProps {
    editMode: boolean
}

const StockSmallWidget: React.FC<StockSmallWidgetProps> = ({editMode}) => {
    const [activeTab, setActiveTab] = useState<string>("spline")

    const chartData = [
        { month: "January", desktop: 186 },
        { month: "February", desktop: 305 },
        { month: "March", desktop: 237 },
        { month: "April", desktop: 73 },
        { month: "May", desktop: 209 },
        { month: "June", desktop: 214 },
        { month: "July", desktop: 154 },
        { month: "August", desktop: 200 },
        { month: "September", desktop: 300 },
        { month: "October", desktop: 100 },
        { month: "November", desktop: 325 },
        { month: "December", desktop: 240 },
    ]
    const chartConfig = {
        desktop: {
            label: "BTC",
        },
    } satisfies ChartConfig

    return (
        <WidgetTemplate className="col-span-1 row-span-1" name={"stockSmall"} editMode={editMode}>
            <div className={"flex flex-col gap-2"}>

                <div className={"flex items-center justify-between gap-4"}>
                    <div className={"flex items-center gap-2"}>
                        <Bitcoin size={26} className={"text-brand bg-primary p-1 rounded-md shadow-lg"}/>
                        <p className={"text-lg font-semibold text-primary"}>BTC</p>
                    </div>

                    <Tabs defaultValue="spline" onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-2 bg-secondary rounded-md h-8">
                            <TabsTrigger value="spline" className={"h-6 px-6 data-[state=active]:text-brand"}>
                                <ChartSpline size={16}/>
                            </TabsTrigger>
                            <TabsTrigger value="candle" className={"h-6 px-6 data-[state=active]:text-brand"}>
                                <ChartCandlestick size={16}/>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className={"flex items-center gap-4 bg-secondary rounded-md px-2"}>
                    <ChartContainer config={chartConfig} className={"max-h-[108px] w-3/4 "}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 5,
                                left: 5,
                            }}
                        >
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Line
                                dataKey="desktop"
                                type="linear"
                                stroke="#398e3d"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                    <div className={"w-1/4 flex flex-col gap-2"}>
                        <div className={"flex items-center justify-center gap-2 px-2 py-1 bg-tertiary rounded-xl border border-main/40"}>
                            <p className={"text-xs"}>24 hours</p>
                            <TrendingUp size={14} className={"text-success"}/>
                        </div>
                        <div className={"flex items-center justify-center gap-2 px-2 py-1 bg-tertiary rounded-xl border border-main/40"}>
                            <p className={"text-xs"}>7 days</p>
                            <TrendingDown size={14} className={"text-error"}/>
                        </div>
                        <div className={"flex items-center justify-center gap-2 px-2 py-1 bg-tertiary rounded-xl border border-main/40"}>
                            <p className={"text-xs"}>30 days</p>
                            <TrendingUp size={14} className={"text-success"}/>
                        </div>
                    </div>
                </div>

            </div>
        </WidgetTemplate>
    )
}

export { StockSmallWidget }