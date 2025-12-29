import { queryOptions } from "@/lib/queryOptions"
import { useQuery } from "@tanstack/react-query"

export type CryptoCurrency = {
    id: string
    name: string
}

export type CryptoProduct = {
    product: string
    base: string
    quote: string
    price: number
    changePercent: number
    candles?: Array<{
        time: number
        low: number
        high: number
        open: number
        close: number
    }>
    error?: string
}

const COINBASE_CURRENCIES_QUERY_KEY = ["coinbase-currencies"] as const
const COINBASE_PRODUCT_QUERY_KEY = (products: string[], timeframe: string) => ["coinbase-prices", products, timeframe] as const

const fetchCoinbaseCurrencies = async () => {
    const response = await fetch("/api/coinbase/currencies")

    if (!response.ok) throw new Error("Failed to fetch Coinbase currencies.")

    return response.json() as Promise<CryptoCurrency[]>
}

const fetchCoinbasePrices = async (products: string[], timeframe: string) => {
    const params = new URLSearchParams()
    params.set("products", products.join(","))
    params.set("timeframe", timeframe)
    const response = await fetch(`/api/coinbase/prices?${params.toString()}`)

    if (!response.ok) throw new Error("Failed to fetch Coinbase prices.")

    return response.json() as Promise<CryptoProduct[]>
}

export const useCoinbase = (products: string[], timeframe: string) => {
    const currenciesQuery = useQuery(queryOptions({
        queryKey: COINBASE_CURRENCIES_QUERY_KEY,
        queryFn: fetchCoinbaseCurrencies,
    }))

    const productQuery = useQuery(queryOptions({
        queryKey: COINBASE_PRODUCT_QUERY_KEY(products, timeframe),
        queryFn: () => fetchCoinbasePrices(products, timeframe),
    }))

    return {
        currencies: currenciesQuery.data,
        currenciesLoading: currenciesQuery.isLoading,
        currenciesError: currenciesQuery.isError,
        products: productQuery.data,
        productsLoading: productQuery.isLoading,
        productsError: productQuery.isError
    }
}
