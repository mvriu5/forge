"use client"

import { Skeleton } from "@/components/ui/Skeleton"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { CryptoCurrency, CryptoProduct, useCoinbase } from "@/hooks/useCoinbase"
import { defineWidget, WidgetProps } from "@tryforgeio/sdk"
import { ArrowDownRight, ArrowUpRight, CandlestickChart, ChartCandlestick } from "lucide-react"
import React, { useCallback, useDeferredValue, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useTooltip } from "../ui/TooltipProvider"
import { DropdownMenu, MenuItem } from "../ui/Dropdown"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"
import { Input } from "../ui/Input"
import { WidgetError } from "./base/WidgetError"

interface CryptoConfig {
    timeframe: string
    products: string[]
}

const DEFAULT_PRODUCTS = ["BTC-USD", "ETH-USD", "SOL-USD"]
const TIMEFRAMES = [
    { key: "1h", label: "1 hour" },
    { key: "24h", label: "24 hours" },
    { key: "1w", label: "1 week" },
    { key: "1m", label: "1 month" },
    { key: "3m", label: "3 months" },
    { key: "6m", label: "6 months" },
    { key: "1y", label: "1 year" }
] as const
const SKELETON_KEYS = Array.from({ length: 6 }, (_, index) => `coinbase-skeleton-${index}`)

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

const CryptoWidget: React.FC<WidgetProps<CryptoConfig>> = ({ config, updateConfig }) => {
    const [timeframe, setTimeframe] = useState(config?.timeframe ?? "24h")
    const [selectedProducts, setSelectedProducts] = useState(config?.products ?? DEFAULT_PRODUCTS)
    const [selectOpen, setSelectOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const deferredSearchTerm = useDeferredValue(searchTerm)

    const { currencies, products, productsLoading, productsError, currenciesError } = useCoinbase(selectedProducts, timeframe)

    const filteredCurrencies = useMemo(() => (currencies ?? [])
        .filter((currency) => currency.id !== "USD")
        .map((currency) => ({ id: `${currency.id}-USD`, label: currency.id })
    ), [currencies])

    const timeframeTooltip = useTooltip<HTMLDivElement>({
        message: "Change the timeframe of the displayed stock data",
        anchor: "tc"
    })

    const currencyTooltip = useTooltip<HTMLButtonElement>({
        message: "Filter which currencies you want to see",
        anchor: "tc"
    })

    const dropdownCurrencyItems: MenuItem[] = useMemo(() => {
        if (!dropdownOpen) return []

        const query = deferredSearchTerm.trim().toLowerCase()
        const seen = new Set<string>()
        const defaultAndSelected = new Set<string>([...DEFAULT_PRODUCTS, ...selectedProducts])
        const baseCurrencies = filteredCurrencies.filter((currency) => defaultAndSelected.has(currency.id))
        const searchMatches = query ? filteredCurrencies.filter((currency) => (currency.id.toLowerCase().includes(query) || currency.label.toLowerCase().includes(query))) : []
        const mergedCurrencies = query ? [...baseCurrencies, ...searchMatches] : baseCurrencies
        const items: MenuItem[] = []

        items.push(...mergedCurrencies
            .filter((currency) => {
                if (seen.has(currency.id)) return false
                seen.add(currency.id)
                return true
            })
            .map((currency) => {
                const item: MenuItem = {
                    type: "checkbox",
                    label: currency.label,
                    checked: selectedProducts.includes(currency.id),
                    onCheckedChange: async () => {
                        const newSelected = selectedProducts.includes(currency.id)
                            ? selectedProducts.filter((item) => item !== currency.id)
                            : [...selectedProducts, currency.id]
                        setSelectedProducts(newSelected)
                        if (!updateConfig) return
                        await updateConfig({ timeframe, products: newSelected })
                    }
                }
                return item
            }))

        if (items.length === 0) {
            items.push({
                type: "label",
                label: query ? "No matches found." : "No currencies available."
            })
        }

        return items
    }, [deferredSearchTerm, dropdownOpen, filteredCurrencies, selectedProducts])

    const handleTimeframeChange = useCallback(async (value: string) => {
        setTimeframe(value)
        if (!updateConfig) return
        await updateConfig({ timeframe: value, products: selectedProducts })
    }, [updateConfig, selectedProducts])

    if (productsError || currenciesError) {
        return (
            <WidgetError message={
                productsError
                    ? "An error occurred, while loading the coin data. Try again later."
                    : "An error occurred, while loading the list of currencies. Try again later."
            }/>
        )
    }

    return (
        <>
            <WidgetHeader title={"Crypto"}>
                <DropdownMenu
                    asChild
                    items={dropdownCurrencyItems}
                    align={"start"}
                    onOpenChange={(open) => {
                        setDropdownOpen(open)
                        if (!open) setSearchTerm("")
                    }}
                    header={(
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search currencies..."
                                className="h-6 mb-1 px-2 border-none shadow-none dark:shadow-none focus:border-none focus:outline-none focus:bg-transparent"
                            />
                    )}
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
                <Select value={timeframe} onValueChange={handleTimeframeChange} open={selectOpen} onOpenChange={setSelectOpen}>
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
        <div className="flex items-center justify-between gap-2 bg-secondary rounded-md py-2 px-4">
            <div className="w-1/5 flex flex-col">
                <p className="text-sm font-semibold text-primary">{product.base}</p>
                <p className="text-xs text-tertiary">{product.product}</p>
            </div>
            {product.error ? (
                <p className="text-xs text-error">{product.error}</p>
            ) : (
                <div className="w-4/5 flex items-center gap-3">
                    <div className="w-1/2 flex">
                        <svg
                            viewBox="0 0 120 24"
                            aria-hidden="true"
                            preserveAspectRatio="none"
                            className="w-full h-6"
                        >
                            <polyline
                                fill="none"
                                stroke={product.changePercent >= 0 ? "currentColor" : "currentColor"}
                                className={product.changePercent >= 0 ? "text-success" : "text-error"}
                                strokeWidth="2"
                                points={buildSparklinePoints((product.candles ?? []).map((candle) => candle.close), 120, 24)}
                            />
                        </svg>
                    </div>
                    <div className="w-1/2 flex flex-wrap items-center gap-x-2 justify-between">

                        <p className="text-sm font-mono text-secondary">
                            {formatPrice(product.price, product.quote)}
                        </p>
                        <p
                            className={cn(
                                product.changePercent >= 0
                                    ? "flex items-center gap-1 text-xs font-semibold text-success"
                                    : "flex items-center gap-1 text-xs font-semibold text-error"
                            )}
                        >
                            {product.changePercent >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {formatChange(product.changePercent)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export const cryptoWidgetDefinition = defineWidget({
    name: "Crypto",
    component: CryptoWidget,
    description: "Track live crypto spot prices",
    image: "/crypto_preview.svg",
    tags: ["crypto", "finance"],
    sizes: {
        desktop: { width: 1, height: 2 },
        tablet: { width: 1, height: 2 },
        mobile: { width: 1, height: 2 }
    },
    defaultConfig: {
        timeframe: "24h",
        products: DEFAULT_PRODUCTS
    }
})
