"use client"

import { Skeleton } from "@/components/ui/Skeleton"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { CryptoCurrency, CryptoProduct, useCoinbase } from "@/hooks/useCoinbase"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import { ArrowDownRight, ArrowUpRight, CandlestickChart, ChartCandlestick } from "lucide-react"
import React, { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useTooltip } from "../ui/TooltipProvider"
import { DropdownMenu, MenuItem } from "../ui/Dropdown"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"

const DEFAULT_PRODUCTS = ["BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD", "XRP-USD", "AVAX-USD"]
const TIMEFRAMES = [
    { key: "1h", label: "1 hour" },
    { key: "1d", label: "1 day" },
    { key: "1w", label: "1 week" },
    { key: "1m", label: "1 month" },
    { key: "3m", label: "3 months" },
    { key: "6m", label: "6 months" },
    { key: "1y", label: "1 year" }
] as const
const SKELETON_KEYS = Array.from({ length: DEFAULT_PRODUCTS.length }, (_, index) => `coinbase-skeleton-${index}`)

const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2
    }).format(price)
}

const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? "+" : ""
    return `${sign}${changePercent.toFixed(2)}%`
}

const buildSparklinePoints = (values: number[], width: number, height: number) => {
    if (values.length === 0) return ""
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    return values
        .map((value, index) => {
            const divisor = Math.max(values.length - 1, 1)
            const x = (index / divisor) * width
            const y = height - ((value - min) / range) * height
            return `${x.toFixed(2)},${y.toFixed(2)}`
        })
        .join(" ")
}

const CryptoWidget: React.FC<WidgetProps> = () => {
    const [timeframe, setTimeframe] = useState("1d")
    const [selectedProducts, setSelectedProducts] = useState(DEFAULT_PRODUCTS)
    const [selectOpen, setSelectOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const { currencies, products, productsLoading, productsError } = useCoinbase(selectedProducts, timeframe)

    const filteredCurrencies = useMemo(() => (currencies ?? [])
        .filter((currency) => currency.id !== "USD")
        .map((currency) => ({ value: `${currency.id}-USD`, label: currency.id })
    ), [currencies])

    const timeframeTooltip = useTooltip<HTMLDivElement>({
        message: "Change the timeframe of the displayed stock data",
        anchor: "tc"
    })

    const currencyTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter which currencies you want to see",
        anchor: "tc"
    })

    const dropdownCurrencyItems: MenuItem[] = useMemo(() => Array.from(new Set(filteredCurrencies?.map((currency: any) => ({
        type: "checkbox",
        key: currency.id,
        label: currency.label,
        checked: selectedProducts.includes(currency.id),
        onCheckedChange: () => setSelectedProducts((prev) => (prev.includes(currency.id) ? prev.filter((l) => l !== currency.id) : [...prev, currency.id]))
    })))), [currencies, selectedProducts, setSelectedProducts])

    return (
        <>
            <WidgetHeader title={"Crypto"}>
                <DropdownMenu
                    asChild
                    items={dropdownCurrencyItems}
                    align={"start"}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                >
                    <Button
                        data-state={dropdownOpen ? "open" : "closed"}
                        variant={"widget"}
                        className={"group data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}
                        disabled={!currencies || currencies?.length === 0 || productsLoading}
                        {...currencyTooltip}
                    >
                        <CandlestickChart size={16} />
                    </Button>
                </DropdownMenu>
                <Select value={timeframe} onValueChange={setTimeframe} open={selectOpen} onOpenChange={setSelectOpen}>
                    <SelectTrigger
                        data-state={selectOpen ? "open" : "closed"}
                        className="w-max border-0 h-6 px-2 shadow-none dark:shadow-none bg-transparent hover:bg-inverted/10 text-secondary hover:text-primary gap-2 font-normal text-sm data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"
                    >
                        <div className="flex items-center gap-1" {...timeframeTooltip}>
                            <p className="font-mono font-xs text-tertiary">Time:</p>
                            <SelectValue/>
                        </div>
                    </SelectTrigger>
                    <SelectContent className={"border-main/40 w-max"} align="end">
                        {TIMEFRAMES.map((timeframe) => (
                            <SelectItem key={timeframe.key} value={timeframe.key} className="h-6">
                                {timeframe.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

            </WidgetHeader>
            <WidgetContent scroll className="gap-2">
                {productsLoading ? (
                    <div className="flex flex-col gap-2">
                        {SKELETON_KEYS.map((key) => (
                            <Skeleton key={key} className="h-14 w-full rounded-md" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {(products ?? []).map((product) => (
                            <CurrencyCard key={product.product} product={product} />
                        ))}
                    </div>
                )}
            </WidgetContent>
        </>
    )
}

const CurrencyCard = ({product}: {product: CryptoProduct}) => {
    return (
        <div className="flex items-center justify-between gap-2 bg-secondary rounded-md p-2">
            <div className="w-1/4 flex flex-col">
                <p className="text-sm font-semibold text-primary">{product.base}</p>
                <p className="text-xs text-tertiary">{product.product}</p>
            </div>
            {product.error ? (
                <p className="text-xs text-error">{product.error}</p>
            ) : (
                <div className="w-3/4 flex items-center gap-3">
                    <div className="w-1/2 hidden sm:flex">
                        <svg width={120} height={24} viewBox="0 0 120 24" aria-hidden="true">
                            <polyline
                                fill="none"
                                stroke={product.changePercent >= 0 ? "currentColor" : "currentColor"}
                                className={product.changePercent >= 0 ? "text-success" : "text-error"}
                                strokeWidth="2"
                                points={buildSparklinePoints((product.candles ?? []).map((candle) => candle.close), 120, 24)}
                            />
                        </svg>
                    </div>
                    <p className="w-1/4 text-sm font-mono text-secondary">
                        {formatPrice(product.price, product.quote)}
                    </p>
                    <p
                        className={cn(
                            "w-1/4",
                            product.changePercent >= 0
                                ? "flex items-center gap-1 text-xs font-semibold text-success"
                                : "flex items-center gap-1 text-xs font-semibold text-error"
                        )}
                    >
                        {product.changePercent >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {formatChange(product.changePercent)}
                    </p>
                </div>
            )}
        </div>
    )
}

export const cryptoWidgetDefinition = defineWidget({
    name: "Crypto",
    component: CryptoWidget,
    description: "Track live crypto spot prices",
    image: "/github_preview.svg",
    tags: ["crypto", "finance"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    }
})
