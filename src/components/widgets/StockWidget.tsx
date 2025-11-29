"use client"

import React, {useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {useStock} from "@/hooks/useStock"
import {ChartConfig} from "@/components/ui/Chart"
import {cn} from "@/lib/utils"
import {ChartCandlestick, CheckIcon, TrendingDown, TrendingUp, TriangleAlert} from "lucide-react"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {Skeleton} from "@/components/ui/Skeleton"
import {Callout} from "@/components/ui/Callout"
import {StockChart} from "@/components/widgets/components/StockChart"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Button} from "@/components/ui/Button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/Command"
import type {AssetOption, ChartDataPoint} from "@/hooks/useStock"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetEmpty} from "./base/WidgetEmpty"
import {Spinner} from "@/components/ui/Spinner"
import {useWidgetActions} from "@/components/widgets/base/WidgetActionContext"

const StockWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    const {updateWidget} = useWidgetActions()
    const { query, setQuery, assetList, assetListLoading, assetListError } = useStock()

    const [selectedStocks, setSelectedStocks] = useState<AssetOption[]>(widget?.config?.stocks ?? [])
    const [timespan, setTimespan] = useState<string>(widget?.config?.timespan ?? "365")
    const [open, setOpen] = useState(false)

    const handleSave = async (updatedConfig: Partial<{ stocks: AssetOption[], timespan: string }>) => {
        if (!widget) return
        await updateWidget({
            ...widget,
            config: {
                ...widget.config,
                ...updatedConfig
            }
        })
    }

    const stockList = useMemo(() => {
        if (!assetList) return selectedStocks;

        const combined = [...selectedStocks]

        assetList.map(asset => {
            const isDuplicate = combined.some(item => item.value === asset.value)
            if (!isDuplicate) combined.push(asset)
        })

        return combined
    }, [selectedStocks, assetList])

    return (
        <WidgetTemplate id={id} widget={widget} name={"stock"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Stock Overview"}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            data-state={open ? "open" : "closed"}
                            variant={"widget"}
                            className={"data-[state=open]:text-primary data-[state=open]:bg-inverted/10"}
                        >
                            <ChartCandlestick size={16}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={"border-0 p-0 w-[160px]"} align={"start"}>
                        <Command className={"border-main/60"}>
                            <CommandInput placeholder="Search stock..." value={query} onValueChange={setQuery} key="stock-search"/>
                            <CommandEmpty className={"flex items-center justify-center p-4"}>
                                {assetListLoading ? "No results found." : <Spinner/>}
                            </CommandEmpty>
                            <CommandList className={"scrollbar-hide"}>
                                <CommandGroup>
                                    <ScrollArea className={"h-56"}>
                                        {stockList?.map((item) => (
                                            <CommandItem
                                                key={item.value}
                                                value={item.label}
                                                onSelect={() => {
                                                    const newSelectedStocks = selectedStocks.includes(item)
                                                        ? selectedStocks.filter(s => s !== item)
                                                        : [...selectedStocks, item]

                                                    setSelectedStocks(newSelectedStocks)
                                                    handleSave({ stocks: newSelectedStocks })
                                                    setOpen(false)
                                                }}
                                                className={cn(
                                                    "flex items-center justify-between hover:text-primary",
                                                    selectedStocks.includes(item) && "bg-brand/5 text-brand hover:text-brand"
                                                )}
                                            >
                                                <span>{item.label}</span>
                                                {selectedStocks.includes(item) && <CheckIcon size={16} className="mr-2" />}
                                            </CommandItem>
                                        ))}
                                    </ScrollArea>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <Select
                    value={timespan}
                    onValueChange={(value) => {
                        setTimespan(value)
                        handleSave({ timespan: value })
                    }}
                >
                    <SelectTrigger className={"w-max bg-tertiary border-0 h-6 shadow-none dark:shadow-none data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
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
            </WidgetHeader>
            {selectedStocks.length > 0 ? (
                <WidgetContent scroll>
                    <div className={"w-full flex flex-col gap-2 items-center"}>
                        {selectedStocks.map((stock) => (
                            <Stock key={stock.value} selectedStock={stock} selectedTimespan={timespan} />
                        ))}
                    </div>
                </WidgetContent>
            ) : (
                <WidgetEmpty message={"No stocks added."}/>
            )}
        </WidgetTemplate>
    )
}

interface StockProps {
    selectedStock: AssetOption
    selectedTimespan: string
    isPlaceholder?: boolean
}

const Stock = ({selectedStock, selectedTimespan, isPlaceholder = false}: StockProps) => {
    const chartConfig = useMemo<ChartConfig>(() => ({ price: { label: "Price" } }), [])

    if (isPlaceholder) {
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
            <div className="relative h-16 w-full flex items-center gap-2 bg-secondary rounded-md px-2 shadow-md border border-main/20 overflow-hidden">
                <div className={"w-1/4 overflow-hidden"}>
                    <p className={"w-full text-primary font-semibold break-words"}>{selectedStock.value}</p>
                </div>
                <div className="w-1/2">
                    <StockChart
                        data={data}
                        yAxisDomain={yAxisDomain}
                        priceChangePercent={-16.9}
                        gradientId={"grad-GOOGL"}
                        chartConfig={chartConfig}
                    />
                </div>

                <div className={"w-1/4 flex flex-col items-center gap-2"}>
                    <p className={"text-secondary text-sm"}>{`$${Number(data[data.length - 1].price.toFixed(2))}`}</p>
                    <div
                        className={cn(
                            "text-sm flex items-center gap-1 px-1 bg-gradient-to-b from-white/2 rounded-md shadow-xl w-max h-max text-error to-error/10"
                        )}
                    >
                        <TrendingDown size={16}/>
                        -16,9%
                    </div>
                </div>
            </div>
        )
    }

    const {data, isLoading, isError, stock, yAxisDomain} = useStock(selectedStock.value, selectedTimespan)
    const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData])
    const percent = useMemo(() => data?.priceChangePercent ?? 0, [data?.priceChangePercent])
    const gradientId = useMemo(() => `stockGrad-${stock}`, [stock])
    const yDomain = useMemo(() => yAxisDomain, [yAxisDomain])

    return (
        <div
            className="relative h-16 w-full flex items-center gap-2 bg-secondary rounded-md px-2 shadow-md border border-main/20 overflow-hidden">
            <div className={"w-1/4 overflow-hidden"}>
                <p className={"w-full text-primary font-semibold break-words"}>{stock}</p>
            </div>
            {isError &&
                <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                    <TriangleAlert size={32}/>
                    An error occurred while loading chart data. Try again later.
                </Callout>
            }
            <div className="w-1/2">
                <StockChart
                    data={chartData}
                    yAxisDomain={yDomain}
                    priceChangePercent={percent}
                    gradientId={gradientId}
                    chartConfig={chartConfig}
                />
            </div>

            {isLoading ? (
                <div className={"w-1/4 flex flex-col items-center gap-2"}>
                    <Skeleton className={"w-16 h-4"}/>
                    <Skeleton className={"w-16 h-4"}/>
                </div>
            ) : (
                <div className={"w-1/4 flex flex-col items-center gap-2"}>
                    <p className={"text-secondary text-sm"}>{`$${Number(data?.currentPrice?.toFixed(2))}`}</p>
                    <div
                        className={cn(
                            "text-sm flex items-center gap-1 px-1 bg-gradient-to-b dark:from-white/2 from-black/2 rounded-md shadow-xl w-max h-max",
                            data?.priceChangePercent! >= 0 ? "text-success to-success/25 dark:to-success/10" : "text-error to-error/25 dark:to-error/10"
                        )}
                    >
                        {data?.priceChangePercent! >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                        {`${Number(data?.priceChangePercent.toFixed(1))}%`}
                    </div>
                </div>
            )}

        </div>
    )
}


export {StockWidget}