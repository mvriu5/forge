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
            value: "BTC/USD",
            label: "Bitcoin",
            type: "crypto",
        },
        {
            value: "ETH/USD",
            label: "Ethereum",
            type: "crypto",
        },
        {
            value: "XRP/USD",
            label: "Ripple",
            type: "crypto",
        },
        {
            value: "SOL/USD",
            label: "Solana",
            type: "crypto",
        },
        {
            value: "ADA/USD",
            label: "Cardano",
            type: "crypto",
        },
        {
            value: "DOGE/USD",
            label: "Dogecoin",
            type: "crypto",
        },
    ]

    return [...popularStocks, ...popularCryptos]
}