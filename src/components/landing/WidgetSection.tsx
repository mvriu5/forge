"use client"

import {Area, AreaChart, XAxis, YAxis} from "recharts"
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/Chart"
import {useMemo} from "react"
import {ChartDataPoint} from "@/actions/twelvedata"
import {TrendingDown} from "lucide-react"
import {cn} from "@/lib/utils"

function WidgetSection() {
    return (
        <div className={"flex flex-col gap-4 px-8"}>
            <p className="flex items-center gap-1.5 font-semibold text-3xl text-brand">
                Discover a variety of widgets
            </p>
            <div className={"h-px w-full rounded-full bg-tertiary"}/>
            <p className="text-xl text-tertiary font-normal">
                Explore all widgets and build your dashboard with an unique style.
            </p>
            <div className={"grid grid-cols-1 md:grid-cols-2 auto-rows-[minmax(120px,auto)] gap-8 pt-8"}>
                <BentoChart/>
                <div className={"col-span-1 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-1 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 md:col-span-2 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

const BentoChart = () => {
    const chartConfig = { price: { label: "Price" } }

    const data: ChartDataPoint[] = [
        { date: '1/27/2025', price: 191.81 },
        { date: '1/28/2025', price: 195.3 },
        { date: '1/29/2025', price: 195.41 },
        { date: '1/30/2025', price: 200.87 },
        { date: '1/31/2025', price: 204.020004 },
        { date: '2/3/2025',  price: 201.23 },
        { date: '2/4/2025',  price: 206.38 },
        { date: '2/5/2025',  price: 191.33 },
        { date: '2/6/2025',  price: 191.60001 },
        { date: '2/7/2025',  price: 185.34 },
        { date: '2/10/2025', price: 186.47 },
        { date: '2/11/2025', price: 185.32001 },
        { date: '2/12/2025', price: 183.61 },
        { date: '2/13/2025', price: 186.14 },
        { date: '2/14/2025', price: 185.23 },
        { date: '2/18/2025', price: 183.77 },
        { date: '2/19/2025', price: 185.27 },
        { date: '2/20/2025', price: 184.56 },
        { date: '2/21/2025', price: 179.66 },
        { date: '2/24/2025', price: 179.25 },
        { date: '2/25/2025', price: 175.42 },
        { date: '2/26/2025', price: 172.73 },
        { date: '2/27/2025', price: 168.5 },
        { date: '2/28/2025', price: 170.28 },
        { date: '3/3/2025',  price: 167.0099945 },
        { date: '3/4/2025',  price: 170.92 },
        { date: '3/5/2025',  price: 173.020004 },
        { date: '3/6/2025',  price: 172.35001 },
        { date: '3/7/2025',  price: 173.86 },
        { date: '3/10/2025', price: 165.87 },
        { date: '3/11/2025', price: 164.039993 },
        { date: '3/12/2025', price: 167.11 },
        { date: '3/13/2025', price: 162.75999 },
        { date: '3/14/2025', price: 165.49001 },
        { date: '3/17/2025', price: 164.28999 },
        { date: '3/18/2025', price: 160.67 },
        { date: '3/19/2025', price: 163.89 },
        { date: '3/20/2025', price: 162.8 },
        { date: '3/21/2025', price: 163.99001 },
        { date: '3/24/2025', price: 167.67999 },
        { date: '3/25/2025', price: 170.56 },
        { date: '3/26/2025', price: 165.059998 },
        { date: '3/27/2025', price: 162.24001 },
        { date: '3/28/2025', price: 154.33 },
        { date: '3/31/2025', price: 154.64 },
        { date: '4/1/2025',  price: 157.070007 },
        { date: '4/2/2025',  price: 157.039993 },
        { date: '4/3/2025',  price: 150.72 },
        { date: '4/4/2025',  price: 145.60001 },
        { date: '4/7/2025',  price: 146.75 },
        { date: '4/8/2025',  price: 144.7 },
        { date: '4/9/2025',  price: 158.71001 },
        { date: '4/10/2025', price: 152.82001 },
        { date: '4/11/2025', price: 157.14 },
        { date: '4/14/2025', price: 159.070007 },
        { date: '4/15/2025', price: 156.31 },
        { date: '4/16/2025', price: 153.33 },
        { date: '4/17/2025', price: 151.16 },
        { date: '4/21/2025', price: 147.67 },
        { date: '4/22/2025', price: 151.47 },
        { date: '4/23/2025', price: 155.35001 },
        { date: '4/24/2025', price: 159.28 }
    ]

    const yAxisDomain = useMemo(() => {
        if (!data || data.length === 0) return [0, 0]
        const prices = data.map(item => item.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const avg = (min + max) / 2
        const range = Math.max(max - min, avg * 0.1)
        return [avg - range, avg + range]
    }, [])

    return (
        <div className="col-span-1 row-span-1 flex items-center gap-4 bg-primary rounded-md px-4 shadow-xl border border-main/20 overflow-hidden cursor-default pointer-events-none">
            <p className={"w-max text-primary font-semibold text-2xl"}>GOOGL</p>
            <div className={"w-full -my-6"}>
            <ChartContainer className="h-full w-full" config={chartConfig}>
                <AreaChart data={data} margin={{ top: 5 }}>
                    <ChartTooltip
                        cursor={false}
                        labelFormatter={(date: string) => date}
                        content={<ChartTooltipContent />}
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={yAxisDomain} hide />
                    <defs>
                        <linearGradient id={"gradient"} x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor={"#d33131"}
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="80%"
                                stopColor={"#d33131"}
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        type="linear"
                        dataKey="price"
                        stroke={"#d33131"}
                        fill={"url(#gradient)"}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={false}
                    />
                </AreaChart>
            </ChartContainer>
            </div>
            <div className={" flex flex-col items-center gap-2"}>
                <p className={"text-secondary text-xl"}>$159,28</p>
                <div className={cn("text-xl flex items-center gap-1 px-2 py-1 bg-gradient-to-b from-white/2 rounded-md shadow-xl w-max h-max text-error to-error/10")}>
                    <TrendingDown size={16}/>
                    16,9%
                </div>
            </div>
        </div>
    )
}

export {WidgetSection}