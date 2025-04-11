"use client"

import React, {useEffect, useMemo, useState} from "react"
import {WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {TrendingDown, TrendingUp} from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue, Skeleton
} from "lunalabs-ui"
import {Area, AreaChart, YAxis} from "recharts"
import {
    AssetData,
    fetchCryptoData,
    fetchStockData,
} from "@/actions/alphavantage"
import {cn} from "@/lib/utils"
import {getAssetType, getPopularAssets} from "@/lib/assetList"

interface StockSmallWidgetProps {
    editMode: boolean
    onWidgetDelete: (widgetType: string) => void
}

const StockSmallWidget: React.FC<StockSmallWidgetProps> = ({editMode, onWidgetDelete}) => {
    const [assetData, setAssetData] = useState<AssetData | null>({
        chartData: [],
        currentPrice: null,
        priceChange: 0,
        priceChangePercent: 0
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [timespan, setTimespan] = useState<string>("7")
    const [stock, setStock] = useState<string>("AAPL")
    const [assetType, setAssetType] = useState<"stock" | "crypto">("stock")

    const assetOptions = useMemo(() => getPopularAssets(), [])

    const yAxisDomain = useMemo(() => {
        if (!assetData?.chartData || assetData?.chartData.length === 0) return [0, 0]

        const prices = assetData?.chartData.map(item => item.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        const avgPrice = (minPrice + maxPrice) / 2
        const priceRange = maxPrice - minPrice

        const effectiveRange = Math.max(priceRange, avgPrice * 0.1)

        const yMin = avgPrice - effectiveRange
        const yMax = avgPrice + effectiveRange

        return [yMin, yMax]
    }, [assetData?.chartData])

    const chartConfig = {
        price: {
            label: "Price"
        }
    } satisfies ChartConfig

    useEffect(() => {
        const updateAssetInfo = () => {
            const type = getAssetType(stock)
            setAssetType(type)
        }
        updateAssetInfo()
    }, [stock])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const days = Number(timespan)

            try {
                const data = assetType === "stock" ? await fetchStockData(stock, days) : await fetchCryptoData(stock, days)
                setAssetData(data)
            } catch (error) {
                console.error("Fehler beim Abrufen der Daten:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        const intervalId = setInterval(() => fetchData(), 5 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [stock, assetType, timespan])

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
                        {loading || isNaN(assetData?.currentPrice ?? 0) || assetData?.currentPrice === undefined ?
                            <Skeleton className="h-6 w-12"/> :
                            <div className={"text-primary text-sm"}>{`$${assetData?.currentPrice}`}</div>
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
                <div className={cn("h-min bg-secondary rounded-md overflow-hidden", !assetData?.chartData && "hidden")}>
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
                                        hideLabel className={"z-50"}
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
                {(!isNaN(assetData?.priceChangePercent ?? 0) && !assetData?.priceChangePercent === undefined) &&
                    <div
                        className={cn(
                            "relative bottom-10 left-1 flex items-center gap-1 px-2 py-0.5 bg-white/2 rounded-md shadow-xl w-max h-max",
                            assetData?.priceChangePercent! >= 0 ? "text-success" : "text-error"
                        )}
                    >
                        {assetData?.priceChangePercent! >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                        {`${Number(assetData?.priceChangePercent.toFixed(2))}%`}
                    </div>
                }

            </div>
        </WidgetTemplate>
    )
}
export { StockSmallWidget }