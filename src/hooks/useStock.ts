import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchStockData, AssetData } from "@/actions/twelvedata"
import {getPopularAssets } from "@/lib/assetList"

export const useStock = (initialStock?: string, initialTimespan?: string) => {
    const [assetData, setAssetData] = useState<AssetData | null>({
        chartData: [],
        currentPrice: null,
        priceChange: 0,
        priceChangePercent: 0
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [timespan, setTimespan] = useState<string>(initialTimespan ?? "7")
    const [stock, setStock] = useState<string>(initialStock ?? "AAPL")

    const assetOptions = useMemo(() => getPopularAssets(), [])

    const fetchData = useCallback(async () => {
        setLoading(true)

        try {
            const days = Number(timespan)
            const data = await fetchStockData(stock, days)
            setAssetData(data)
        } catch (error) {
            console.error("Fehler beim Abrufen der Daten:", error)
        } finally {
            setLoading(false)
        }
    }, [stock, timespan])

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [fetchData])

    const yAxisDomain = useMemo(() => {
        if (!assetData?.chartData || assetData.chartData.length === 0) return [0, 0]
        const prices = assetData.chartData.map(item => item.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const avg = (min + max) / 2
        const range = Math.max(max - min, avg * 0.1)
        return [avg - range, avg + range]
    }, [assetData?.chartData])

    return {
        assetData,
        loading,
        stock,
        setStock,
        timespan,
        setTimespan,
        yAxisDomain,
        assetOptions
    }
}