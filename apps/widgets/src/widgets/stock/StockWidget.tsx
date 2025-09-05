"use client"

import React, {useMemo, useState} from "react"
import {ChartCandlestick, CheckIcon, TrendingDown, TrendingUp, TriangleAlert} from "lucide-react"
import {WidgetEmpty} from "../base/WidgetEmpty"
import { WidgetProps, WidgetTemplate } from "../base/WidgetTemplate"
import { WidgetHeader } from "../base/WidgetHeader"
import {Popover, PopoverContent, PopoverTrigger} from "@forge/ui/components/Popover"
import { Button } from "@forge/ui/components/Button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@forge/ui/components/Command"
import {Spinner} from "@forge/ui/components/Spinner"
import { ScrollArea } from "@forge/ui/components/ScrollArea"
import { cn } from "@forge/ui/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@forge/ui/components/Select"
import { WidgetContent } from "../base/WidgetContent"
import {StockChart} from "../components/StockChart.tsx"
import { Callout } from "@forge/ui/components/Callout"
import { Skeleton } from "@forge/ui/components/Skeleton"

type StockHookReturn = {
    data: {
        chartData: any[]
        currentPrice?: number
        priceChangePercent: number
    }
    isLoading: boolean
    isError: boolean
    stock: string
    yAxisDomain: number[]
    query: string
    setQuery: (query: string) => void
    assetList: any[] | null
    assetListLoading: boolean
    assetListError: boolean
}

interface StockWidgetProps extends WidgetProps {
    onConfigSave: (config: Partial<{ stocks: string[], timespan: string }>) => void
    hook: StockHookReturn
    getHookValues: (stock: string, timespan: string) => StockHookReturn;
}


const StockConnected = ({selectedStock, selectedTimespan, getHook}: { selectedStock: string; selectedTimespan: string; getHook: (stock: string, timespan: string) => StockHookReturn; }) => {
    const hook = getHook(selectedStock, selectedTimespan)
    return <Stock hook={hook}/>
}

const StockWidget: React.FC<StockWidgetProps> = ({widget, editMode, onWidgetDelete, onConfigSave, hook, getHookValues}) => {
    const [selectedStocks, setSelectedStocks] = useState<any[]>(widget.config?.stocks ?? [])
    const [timespan, setTimespan] = useState<string>(widget.config?.timespan ?? "365")
    const [open, setOpen] = useState(false)

    const handleSave = async (updatedConfig: Partial<{ stocks: any[], timespan: string }>) => {
        onConfigSave(updatedConfig)
    }

    const stockList = useMemo(() => {
        if (!hook.assetList) return selectedStocks
        const combined = [...selectedStocks]

        hook.assetList.map((asset: { value: any }) => {
            const isDuplicate = combined.some(item => item.value === asset.value)
            if (!isDuplicate) combined.push(asset)
        })

        return combined
    }, [selectedStocks, hook.assetList])

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                            <CommandInput placeholder="Search stock..." value={hook.query} onValueChange={hook.setQuery} key="stock-search"/>
                            <CommandEmpty className={"flex items-center justify-center p-4"}>
                                {hook.assetListLoading ? "No results found." : <Spinner/>}
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
                            <StockConnected
                                key={stock.value}
                                selectedStock={stock.value}
                                selectedTimespan={timespan}
                                getHook={getHookValues}
                            />
                        ))}
                    </div>
                </WidgetContent>
            ) : (
                <WidgetEmpty message={"No stocks added."}/>
            )}
        </WidgetTemplate>
    )
}

const Stock = ({hook}: {hook: StockHookReturn}) => {
    const chartConfig = useMemo<any>(() => ({ price: { label: "Price" } }), [])
    const chartData = useMemo(() => hook.data?.chartData ?? [], [hook.data?.chartData])
    const percent = useMemo(() => hook.data?.priceChangePercent ?? 0, [hook.data?.priceChangePercent])
    const gradientId = useMemo(() => `stockGrad-${hook.stock}`, [hook.stock])
    const yDomain = useMemo(() => hook.yAxisDomain, [hook.yAxisDomain])

    return (
        <div
            className="relative h-16 w-full flex items-center gap-2 bg-secondary rounded-md px-2 shadow-md border border-main/20 overflow-hidden">
            <div className={"w-1/4 overflow-hidden"}>
                <p className={"w-full text-primary font-semibold break-words"}>{hook.stock}</p>
            </div>
            {hook.isError &&
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

            {hook.isLoading ? (
                <div className={"w-1/4 flex flex-col items-center gap-2"}>
                    <Skeleton className={"w-16 h-4"}/>
                    <Skeleton className={"w-16 h-4"}/>
                </div>
            ) : (
                <div className={"w-1/4 flex flex-col items-center gap-2"}>
                    <p className={"text-secondary text-sm"}>{`$${Number(hook.data?.currentPrice?.toFixed(2))}`}</p>
                    <div
                        className={cn(
                            "text-sm flex items-center gap-1 px-1 bg-gradient-to-b dark:from-white/2 from-black/2 rounded-md shadow-xl w-max h-max",
                            hook.data?.priceChangePercent! >= 0 ? "text-success to-success/25 dark:to-success/10" : "text-error to-error/25 dark:to-error/10"
                        )}
                    >
                        {hook.data?.priceChangePercent! >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                        {`${Number(hook.data?.priceChangePercent.toFixed(1))}%`}
                    </div>
                </div>
            )}

        </div>
    )
}


export {StockWidget}