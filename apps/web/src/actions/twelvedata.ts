"use server"

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

export const fetchStockData = async (symbol: string, days = 7): Promise<AssetData | null> => {
    const formatDate = (dateStr: string, isDay = false): string => {
        const date = new Date(dateStr)

        if (isDay) return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        return date.toLocaleDateString("en-US")
    }

    try {
        let url: string
        const isDay = days === 1

        if (isDay) {
            url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1h&outputsize=24&apikey=${TWELVEDATA_API_KEY}`
        } else {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days);

            const startDate = start.toISOString().slice(0,10);
            const endDate   = end  .toISOString().slice(0,10);

            url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${TWELVEDATA_API_KEY}`
        }

        const response = await fetch(url)

        if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`)

        const data = await response.json()

        if (data.status === "error") throw new Error(data.message || "API-Fehler aufgetreten")

        if (!data.values || !Array.isArray(data.values)) throw new Error("Ungültiges Datenformat erhalten")

        const dataPoints: ChartDataPoint[] = data.values
            .map((item: TwelveDataTimeSeriesItem) => {
                return {
                    date: formatDate(item.datetime, isDay),
                    price: Number(item.close),
                    rawDate: item.datetime
                }
            })
            .sort((a: ChartDataPoint, b: ChartDataPoint) =>
                new Date(a.rawDate!).getTime() - new Date(b.rawDate!).getTime()
            )
            .map(({ date, price }: ChartDataPoint) => ({ date, price }))

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
                type: s.instrument_type === "Common Stock" ? "stock" : "crypto"
            }))
            .filter((item: any) => {
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