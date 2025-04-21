"use client"

import React, {useEffect, useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {Check, ChevronDown, TrendingDown, TrendingUp} from "lucide-react"
import {ChartConfig} from "@/components/ui/Chart"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {Skeleton} from "@/components/ui/Skeleton"
import {cn} from "@/lib/utils"
import {useStock} from "@/hooks/useStock"
import {useWidgetStore} from "@/store/widgetStore"
import {StockChart} from "@/components/widgets/components/StockChart"
import {Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { Button } from "@/components/ui/Button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/Command"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import { ScrollArea } from "../ui/ScrollArea"

const StockSmallWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {refreshWidget} = useWidgetStore()
    const widget = useWidgetStore(state => state.getWidget("stockSmall"))
    if (!widget) return null

    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverKey, setPopoverKey] = useState(0)

    const {data, isLoading, isError, stock, setStock, timespan, setTimespan, yAxisDomain, query, setQuery, assetList, assetListLoading, assetListError}
    = useStock(widget.config?.stock, widget.config?.timespan)

    useEffect(() => {
        setPopoverKey(prevKey => prevKey + 1)
    }, [assetList])


    const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData])
    const percent = useMemo(() => data?.priceChangePercent ?? 0, [data?.priceChangePercent])
    const gradientId = useMemo(() => `stockGrad-${widget.id}`, [widget.id])
    const yDomain   = useMemo(() => yAxisDomain, [yAxisDomain])
    const chartConfig = useMemo<ChartConfig>(() => ({ price: { label: "Price" } }), [])

    const handleSave = async (updatedConfig: Partial<{ stock: string, timespan: string }>) => {
        await refreshWidget({
            ...widget,
            config: {
                ...widget.config,
               ...updatedConfig
            }
        })
    }

    return (
        <WidgetTemplate className="col-span-1 row-span-1" name={"stockSmall"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <div className={"flex flex-col gap-2 h-full"}>
                <div className={"flex items-center justify-between gap-4"}>
                    <div className={"flex items-center gap-2"}>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen} key={popoverKey}>
                            <PopoverTrigger asChild>
                                <Button
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="group w-[200px] justify-between px-2 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"
                                >
                                    {stock}
                                    <ChevronDown size={12} className="text-secondary group-data-[state=open]:rotate-180 transition-all" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search stock..." value={query} onValueChange={setQuery}/>
                                    <CommandEmpty className={"flex items-center justify-center p-4"}>
                                        {assetListLoading ? "No results found." : <ButtonSpinner/>}
                                    </CommandEmpty>
                                    <CommandList className={"scrollbar-hide"}>
                                        <CommandGroup>
                                            <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
                                                {assetList?.map((item) => (
                                                    <CommandItem
                                                        key={`${item.value}-${item.label}`}
                                                        onSelect={() => {
                                                            setStock(item.value)
                                                            handleSave({ stock: item.value })
                                                            setPopoverOpen(false)
                                                        }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${stock === item.type ? "opacity-100" : "opacity-0"}`}/>
                                                        {item.label}
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className={"flex items-center gap-2"}>
                        {isLoading || Number.isNaN(data?.currentPrice ?? 0) || data?.currentPrice === undefined ?
                            <Skeleton className="h-6 w-12"/> :
                            <div className={"text-primary text-md text-semibold"}>{`$${Number(data?.currentPrice?.toFixed(2))}`}</div>
                        }
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

                {!data?.chartData ||isError &&
                    <div className={"flex items-center justify-center h-full w-full"}>
                        <p className={"text-sm text-error"}>Error loading data</p>
                    </div>
                }
                <div className={cn("relative flex-1 bg-secondary rounded-md overflow-hidden", (!data?.chartData || isError) && "hidden")}>
                    <div
                        className={cn(
                            "absolute bottom-1 left-1 flex items-center gap-1 px-2 py-0.5 bg-white/2 rounded-md shadow-xl w-max h-max",
                            data?.priceChangePercent! >= 0 ? "text-success" : "text-error"
                        )}
                    >
                        {data?.priceChangePercent! >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                        {`${Number(data?.priceChangePercent.toFixed(2))}%`}
                    </div>
                    <StockChart data={chartData} yAxisDomain={yDomain} priceChangePercent={percent} gradientId={gradientId} chartConfig={chartConfig}/>
                </div>
            </div>
        </WidgetTemplate>
    )
}
export { StockSmallWidget }