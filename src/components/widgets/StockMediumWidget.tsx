"use client"

import React, {useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {useStock} from "@/hooks/useStock"
import {ChartConfig} from "@/components/ui/Chart"
import {cn} from "@/lib/utils"
import {ChartCandlestick, CheckIcon, TrendingDown, TrendingUp, TriangleAlert} from "lucide-react"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {useWidgetStore} from "@/store/widgetStore"
import {Skeleton} from "@/components/ui/Skeleton"
import {Callout} from "@/components/ui/Callout"
import {StockChart} from "@/components/widgets/components/StockChart"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Button} from "@/components/ui/Button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/Command"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {AssetOption} from "@/actions/twelvedata"

const StockMediumWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {refreshWidget} = useWidgetStore()
    const widget = useWidgetStore(state => state.getWidget("stockMedium"))
    if (!widget) return null

    const [selectedStocks, setSelectedStocks] = useState<AssetOption[]>(widget.config?.stocks ?? [])
    const [timespan, setTimespan] = useState<string>(widget.config?.timespan ?? "365")
    const [open, setOpen] = useState(false)

    const handleSave = async (updatedConfig: Partial<{ stocks: AssetOption[], timespan: string }>) => {
        await refreshWidget({
            ...widget,
            config: {
                ...widget.config,
                ...updatedConfig
            }
        })
    }

    const { query, setQuery, assetList, assetListLoading, assetListError } = useStock()

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
        <WidgetTemplate className={"col-span-1 row-span-2"} name={"stockMedium"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className={"h-full flex flex-col gap-2"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <p className={"text-lg text-primary font-semibold truncate"}>Stock Overview</p>
                    <div className={"flex items-center gap-2"}>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    data-state={open ? "open" : "closed"}
                                    className={cn("font-normal bg-tertiary border-main/60 text-sm items-center gap-2 data-[state=open]:text-primary data-[state=open]:bg-inverted/10 px-2")}
                                >
                                    <ChartCandlestick size={18}/>
                                    Stocks
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className={"border-0 p-0 w-[160px]"} align={"start"}>
                                <Command className={"border-main/60"}>
                                    <CommandInput placeholder="Search stock..." value={query} onValueChange={setQuery} key="stock-search"/>
                                    <CommandEmpty className={"flex items-center justify-center p-4"}>
                                        {assetListLoading ? "No results found." : <ButtonSpinner/>}
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
                                                        className="flex items-center justify-between"
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
                            <SelectTrigger className={"w-[100px] bg-tertiary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
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
                <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
                    <div className={"w-full flex flex-col gap-2 items-center"}>
                        {selectedStocks.map((stock) => (
                            <Stock key={stock.value} selectedStock={stock} selectedTimespan={timespan} />
                        ))}
                        {selectedStocks.length === 0 &&
                            <p className={"text-sm text-tertiary mt-4"}>No stock added yet.</p>
                        }
                    </div>
                </ScrollArea>
            </div>
        </WidgetTemplate>
    )
}

interface StockProps {
    selectedStock: AssetOption
    selectedTimespan: string
}

const Stock = ({selectedStock, selectedTimespan}: StockProps) => {
    const { data, isLoading, isError, stock, yAxisDomain } = useStock(selectedStock.value, selectedTimespan)

    const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData])
    const percent = useMemo(() => data?.priceChangePercent ?? 0, [data?.priceChangePercent])
    const gradientId = useMemo(() => `stockGrad-${stock}`, [stock])
    const yDomain   = useMemo(() => yAxisDomain, [yAxisDomain])
    const chartConfig = useMemo<ChartConfig>(() => ({ price: { label: "Price" } }), [])

    return (
        <div className="relative w-full flex items-center gap-2 bg-secondary rounded-md py-2 shadow-md border border-main/20">
            <div className={"flex flex-col items-center gap-2 px-2"}>
                <div className={"w-full flex flex-col items-center gap-2 p-1 bg-linear-to-b from-primary/20 via-primary/50 to-brand/5 rounded-md"}>
                    <p className={"text-primary font-semibold"}>{stock}</p>
                    {isLoading ?
                        <Skeleton className={"w-16 h-6"}/> :
                        <p className={"text-secondary"}>{`$${Number(data?.currentPrice?.toFixed(2))}`}</p>
                    }
                </div>

                <div
                    className={cn(
                        "flex items-center gap-1 px-2 py-0.5 bg-gradient-to-b from-white/2 rounded-md shadow-xl w-max h-max",
                        data?.priceChangePercent! >= 0 ? "text-success to-success/10" : "text-error to-error/10"
                    )}
                >
                    {data?.priceChangePercent! >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                    {`${Number(data?.priceChangePercent.toFixed(2))}%`}
                </div>

            </div>
            {isError &&
                <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                    <TriangleAlert size={32}/>
                    An error occurred while loading chart data. Try again later.
                </Callout>
            }
            <StockChart data={chartData} yAxisDomain={yDomain} priceChangePercent={percent} gradientId={gradientId} chartConfig={chartConfig}/>
        </div>
    )
}


export {StockMediumWidget}