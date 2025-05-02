"use client"

import React, {useMemo, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {Check, ChevronDown, TrendingDown, TrendingUp} from "lucide-react"
import {ChartConfig} from "@/components/ui/Chart"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {Skeleton} from "@/components/ui/Skeleton"
import {cn} from "@/lib/utils"
import {useStock} from "@/hooks/useStock"
import {useWidgetStore} from "@/store/widgetStore"
import {StockChart} from "@/components/widgets/components/StockChart"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Button} from "@/components/ui/Button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/Command"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {WidgetHeader} from "@/components/widgets/WidgetHeader"
import {WidgetContent} from "@/components/widgets/WidgetContent"
import {ChartDataPoint} from "@/actions/twelvedata"
import {useDashboardStore} from "@/store/dashboardStore"

const StockSmallWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete, isPlaceholder}) => {
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
            <WidgetTemplate className="col-span-1 row-span-1" name={"stockSmall"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader>
                    <div className={"w-full flex items-center justify-between gap-4"}>
                        <Button className="group w-max gap-2 font-normal text-sm justify-between px-2 text-primary">
                            GOOGL
                            <ChevronDown size={12} className="text-secondary group-data-[state=open]:rotate-180 transition-all" />
                        </Button>
                        <div className={"flex items-center gap-2"}>
                            <div className={"text-primary text-md text-semibold"}>{`$${Number(data[data.length - 1].price.toFixed(2))}`}</div>
                            <Select value={"90"}>
                                <SelectTrigger className={"w-[100px] bg-tertiary"}>
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
                </WidgetHeader>
                <WidgetContent>
                    <div className={cn("relative flex bg-secondary rounded-md overflow-hidden")}>
                        <div
                            className={cn(
                                "absolute bottom-1 left-1 flex items-center gap-1 px-2 py-0.5 bg-white/2 rounded-md shadow-xl w-max h-max text-error"
                            )}
                        >
                            <TrendingDown size={20}/>
                            -16.9%
                        </div>
                        <StockChart data={data} yAxisDomain={yAxisDomain} priceChangePercent={-16.9} gradientId={"grad-GOOGL"} chartConfig={chartConfig}/>
                    </div>
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const {getWidget, refreshWidget} = useWidgetStore()
    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "stockSmall")
    if (!widget) return

    const [popoverOpen, setPopoverOpen] = useState(false)

    const {data, isLoading, isError, stock, setStock, timespan, setTimespan, yAxisDomain, query, setQuery, assetList, assetListLoading, assetListError}
    = useStock(widget.config?.stock, widget.config?.timespan)

    const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData])
    const percent = useMemo(() => data?.priceChangePercent ?? 0, [data?.priceChangePercent])
    const gradientId = useMemo(() => `stockGrad-${widget.id}`, [widget.id])
    const yDomain   = useMemo(() => yAxisDomain, [yAxisDomain])

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
            <WidgetHeader>
                <div className={"w-full flex items-center justify-between gap-4"}>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="group w-max gap-2 font-normal text-sm justify-between px-2 data-[state=open]:bg-inverted/10 text-primary"
                                >
                                    {stock}
                                    <ChevronDown size={12} className="text-secondary group-data-[state=open]:rotate-180 transition-all" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0 border-0" align={"start"}>
                                <Command>
                                    <CommandInput placeholder="Search stock..." value={query} onValueChange={setQuery} key="stock-search"/>
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
            </WidgetHeader>
            <WidgetContent>
                {!isLoading && (!data?.chartData || isError) ? (
                    <div className={"flex items-center justify-center h-full w-full"}>
                        <p className={"text-sm text-error"}>Error loading data</p>
                    </div>
                ) : (
                    <div className={cn("relative flex bg-secondary rounded-md overflow-hidden", (!data?.chartData || isError) && "hidden")}>
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
                )}
            </WidgetContent>
        </WidgetTemplate>
    )
}
export { StockSmallWidget }