import {useMemo, useState} from "react"
import {getPopularAssets} from "@/lib/assetList"
import {useQuery} from "@tanstack/react-query"

const STOCK_QUERY_KEY = (stock: string, timespan: string) => ['stock', stock, timespan] as const
const SYMBOL_QUERY_KEY = (query: string) => ['symbol', query] as const


export interface AssetOption {
    value: string
    label: string
    type: "stock" | "crypto"
}

export interface ChartDataPoint {
    date: string
    price: number
    rawDate?: string
}

export interface AssetData {
    chartData: ChartDataPoint[]
    currentPrice: number | null
    priceChange: number
    priceChangePercent: number
    lastUpdated?: number
}

interface TwelveDataTimeSeriesItem {
    datetime: string
    close: string
    [key: string]: any
}

const TWELVEDATA_API_KEY = process.env.TWELVEDATA_API_KEY

const formatDate = (dateStr: string, isDay = false): string => {
    const date = new Date(dateStr)

    if (isDay) return date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit"})
    return date.toLocaleDateString("en-US")
}

export const fetchStockData = async (symbol: string, days = 7): Promise<AssetData | null> => {
    try {
        let url: string
        const isDay = days === 1

        if (isDay) {
            url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1h&outputsize=24&apikey=${TWELVEDATA_API_KEY}`
        } else {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - days)

            const startDate = start.toISOString().slice(0, 10)
            const endDate = end.toISOString().slice(0, 10)

            url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${TWELVEDATA_API_KEY}`
        }

        const response = await fetch(url)

        if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`)

        const data = await response.json()

        if (data.status === "error") throw new Error(data.message || "API-Fehler aufgetreten")

        if (!data.values || !Array.isArray(data.values)) throw new Error("Ungültiges Datenformat erhalten")

        const dataPoints: ChartDataPoint[] = data.values
            .map((item: TwelveDataTimeSeriesItem) => ({
                date: formatDate(item.datetime, isDay),
                price: Number(item.close),
                rawDate: item.datetime,
            }))
            .sort((a: ChartDataPoint, b: ChartDataPoint) =>
                new Date(a.rawDate!).getTime() - new Date(b.rawDate!).getTime(),
            )
            .map(({date, price}: ChartDataPoint) => ({date, price}))

        let currentPrice = null
        let priceChange = 0
        let priceChangePercent = 0

        if (dataPoints.length > 0) {
            const latestPrice = dataPoints[dataPoints.length - 1].price
            const firstPrice = dataPoints[0].price

            currentPrice = latestPrice
            priceChange = latestPrice - firstPrice
            priceChangePercent = ((latestPrice - firstPrice) / firstPrice) * 100
        }

        return {
            chartData: dataPoints,
            currentPrice,
            priceChange,
            priceChangePercent,
            lastUpdated: Date.now(),
        }
    } catch (err: any) {
        return null
    }
}

export async function searchSymbols(query: string, limit = 20): Promise<AssetOption[]> {
    try {
        const url = `https://api.twelvedata.com/symbol_search?apikey=${TWELVEDATA_API_KEY}&symbol=${query}&limit=${limit}`

        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`)

        const json = await response.json()
        if (json.status === "error") throw new Error(json.message || "API-Fehler")

        const seenSymbols = new Set<string>()

        return json.data
            .map((s: any) => ({
                value: s.symbol,
                label: s.instrument_name,
                type: s.instrument_type === "Common Stock" ? "stock" : "crypto",
            }))
            .filter((item: AssetOption) => {
                if (!seenSymbols.has(item.value)) {
                    seenSymbols.add(item.value)
                    return true
                }
                return false
            })
    } catch (err) {
        console.error("searchAssets Error:", err)
        return []
    }
}

export const useStock = (initialStock?: string, initialTimespan?: string) => {
    const [timespan, setTimespan] = useState<string>(initialTimespan ?? "7")
    const [stock, setStock] = useState<string>(initialStock ?? "AAPL")
    const [query, setQuery] = useState<string>("")

    const { data, isLoading, isError } = useQuery<AssetData | null, Error>({
        queryKey: STOCK_QUERY_KEY(stock, timespan),
        queryFn: () => fetchStockData(stock, Number(timespan)),
        refetchInterval: 15 * 60 * 1000, // 15 minutes
        staleTime: 15 * 60 * 1000 // 15 minutes
    })

    const { data: assetList, isLoading: searchLoading, isError: searchError } = useQuery<AssetOption[], Error>({
        queryKey: SYMBOL_QUERY_KEY(query),
        queryFn: () => searchSymbols(query),
        enabled: Boolean(query.trim().length > 0),
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: getPopularAssets()
    })

    const assetListLoading = query.trim().length > 0 ? searchLoading : false
    const assetListError   = query.trim().length > 0 ? searchError   : false

    const yAxisDomain = useMemo(() => {
        if (!data?.chartData || data.chartData.length === 0) return [0, 0]
        const prices = data.chartData.map(item => item.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const avg = (min + max) / 2
        const range = Math.max(max - min, avg * 0.1)
        return [avg - range, avg + range]
    }, [data?.chartData])

    return {
        data,
        isLoading,
        isError,
        stock,
        setStock,
        timespan,
        setTimespan,
        yAxisDomain,
        query,
        setQuery,
        assetList,
        assetListLoading,
        assetListError
    }
}