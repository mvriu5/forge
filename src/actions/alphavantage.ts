"use server"

import { cache } from "react"

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

const CACHE_DURATION = 15 * 60 * 1000
const ALPHA_VANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY

export const fetchStockData = cache(async (symbol: string, days = 7): Promise<AssetData | null> => {
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("de-DE", { month: "short", day: "numeric" })
    }

    try {
        const cacheKey = `stock-${symbol}-${days}`

        const cachedData = globalThis.__stockCache?.[cacheKey] as AssetData | undefined

        if (cachedData && cachedData.lastUpdated && Date.now() - cachedData.lastUpdated < CACHE_DURATION) {
            console.log(`Verwende Cache-Daten für ${symbol}`)
            return cachedData
        }

        console.log(`Hole frische Daten für ${symbol} von Alpha Vantage`)


        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`,
        )

        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`)
        }

        const data = await response.json()

        if (data["Error Message"]) {
            throw new Error(data["Error Message"])
        }

        if (data["Note"] && data["Note"].includes("API call frequency")) {
            throw new Error("API-Limit überschritten. Bitte versuche es später erneut.")
        }

        const timeSeriesKey = "Time Series (Daily)"
        const timeSeries = data[timeSeriesKey]

        if (!timeSeries) return null

        const dataPoints: ChartDataPoint[] = Object.entries(timeSeries)
            .map(([date, values]: [string, any]) => {
                const closePrice = Number.parseFloat(values["4. close"])
                return {
                    date: formatDate(date),
                    price: closePrice,
                    rawDate: date, // Für die Sortierung
                }
            })
            .sort((a, b) => new Date(b.rawDate!).getTime() - new Date(a.rawDate!).getTime())
            .slice(0, days) // Beschränke auf die angeforderte Anzahl von Tagen
            .map(({ date, price }) => ({ date, price })) // Entferne das rawDate-Feld
            .reverse() // Umkehren, damit die Daten chronologisch sind

        let currentPrice = null
        let priceChange = 0
        let priceChangePercent = 0

        if (dataPoints.length > 0) {
            const latestPrice = dataPoints[dataPoints.length - 1].price
            const previousPrice = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2].price : latestPrice

            currentPrice = latestPrice
            priceChange = latestPrice - previousPrice
            priceChangePercent = ((latestPrice - previousPrice) / previousPrice) * 100
        }

        const result = {
            chartData: dataPoints,
            currentPrice,
            priceChange,
            priceChangePercent,
            error: null,
            lastUpdated: Date.now(),
        }

        if (!globalThis.__stockCache) globalThis.__stockCache = {}
        globalThis.__stockCache[cacheKey] = result

        return result
    } catch (err: any) {
        console.error("Fehler beim Laden der Aktiendaten:", err)

        return null
    }
})

/**
 * Holt Kryptowährungsdaten von Alpha Vantage
 */
export async function fetchCryptoData(symbol: string, days = 7): Promise<AssetData | null> {
    // Funktion zum Formatieren des Datums
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("de-DE", { month: "short", day: "numeric" })
    }
    try {
        // API-Anfrage an Alpha Vantage
        const response = await fetch(
            `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${ALPHA_VANTAGE_API_KEY}`,
        )

        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`)
        }

        const data = await response.json()

        // Überprüfe, ob die API einen Fehler zurückgegeben hat
        if (data["Error Message"]) {
            throw new Error(data["Error Message"])
        }

        if (data["Note"] && data["Note"].includes("API call frequency")) {
            throw new Error("API-Limit überschritten. Bitte versuche es später erneut.")
        }

        // Extrahiere die Zeitreihen-Daten
        const timeSeriesKey = "Time Series (Digital Currency Daily)"
        const timeSeries = data[timeSeriesKey]

        if (!timeSeries) return null


        // Konvertiere die Daten in ein Array und sortiere sie nach Datum
        const dataPoints: ChartDataPoint[] = Object.entries(timeSeries)
            .map(([date, values]: [string, any]) => {
                const closePrice = Number.parseFloat(values["4a. close (USD)"])
                return {
                    date: formatDate(date),
                    price: closePrice,
                    rawDate: date, // Für die Sortierung
                }
            })
            .sort((a, b) => new Date(b.rawDate!).getTime() - new Date(a.rawDate!).getTime())
            .slice(0, days) // Beschränke auf die angeforderte Anzahl von Tagen
            .map(({ date, price }) => ({ date, price })) // Entferne das rawDate-Feld
            .reverse() // Umkehren, damit die Daten chronologisch sind

        // Berechne den aktuellen Preis und die Preisänderung
        let currentPrice = null
        let priceChange = 0
        let priceChangePercent = 0

        if (dataPoints.length > 0) {
            const latestPrice = dataPoints[dataPoints.length - 1].price
            const previousPrice = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2].price : latestPrice

            currentPrice = latestPrice
            priceChange = latestPrice - previousPrice
            priceChangePercent = ((latestPrice - previousPrice) / previousPrice) * 100
        }

        return {
            chartData: dataPoints,
            currentPrice,
            priceChange,
            priceChangePercent
        }
    } catch (err: any) {
        console.error("Fehler beim Laden der Kryptodaten:", err)
        return null
    }
}

declare global {
    var __stockCache: Record<string, AssetData> | undefined
}
