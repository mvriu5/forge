import {useMemo, useState} from "react"
import {AssetData, AssetOption, fetchStockData, searchSymbols} from "@/actions/twelvedata"
import {getPopularAssets} from "@/lib/assetList"
import {useQuery} from "@tanstack/react-query"

export const useStock = (initialStock?: string, initialTimespan?: string) => {
    const [timespan, setTimespan] = useState<string>(initialTimespan ?? "7")
    const [stock, setStock] = useState<string>(initialStock ?? "AAPL")
    const [query, setQuery] = useState<string>("")

    const { data, isLoading, isError } = useQuery<AssetData | null, Error>({
        queryKey: ['stock', stock, timespan],
        queryFn: async () => await fetchStockData(stock, Number(timespan)),
        refetchInterval: 15 * 60 * 1000, // 15 minutes
        staleTime: 15 * 60 * 1000 // 15 minutes
    })

    const { data: assetList, isLoading: searchLoading, isError: searchError } = useQuery<AssetOption[], Error>({
        queryKey: ['symbol', query],
        queryFn: async () => await searchSymbols(query),
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