export interface AssetOption {
    value: string
    label: string
    type: "stock" | "crypto"
}

export function getPopularAssets(): AssetOption[] {
    const popularStocks: AssetOption[] = [
        {
            value: "AAPL",
            label: "Apple",
            type: "stock",
        },
        {
            value: "MSFT",
            label: "Microsoft",
            type: "stock",
        },
        {
            value: "GOOGL",
            label: "Google",
            type: "stock",
        },
        {
            value: "AMZN",
            label: "Amazon",
            type: "stock",
        },
        {
            value: "META",
            label: "Meta",
            type: "stock",
        },
        {
            value: "TSLA",
            label: "Tesla",
            type: "stock",
        },
        {
            value: "NVDA",
            label: "NVIDIA",
            type: "stock",
        },
        {
            value: "IBM",
            label: "IBM",
            type: "stock",
        },
    ]

    const popularCryptos: AssetOption[] = [
        {
            value: "BTC",
            label: "Bitcoin",
            type: "crypto",
        },
        {
            value: "ETH",
            label: "Ethereum",
            type: "crypto",
        },
        {
            value: "XRP",
            label: "Ripple",
            type: "crypto",
        },
        {
            value: "SOL",
            label: "Solana",
            type: "crypto",
        },
        {
            value: "ADA",
            label: "Cardano",
            type: "crypto",
        },
        {
            value: "DOGE",
            label: "Dogecoin",
            type: "crypto",
        },
    ]

    return [...popularStocks, ...popularCryptos]
}


export function getAssetType(assetValue: string): "stock" | "crypto" {
    const assets = getPopularAssets()
    const asset = assets.find((a) => a.value === assetValue)

    if (!asset) {
        return ["BTC", "ETH", "XRP", "SOL", "ADA", "DOGE"].includes(assetValue) ? "crypto" : "stock"
    }

    return asset.type
}