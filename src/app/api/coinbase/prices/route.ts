import { NextResponse } from "next/server"
import crypto from "crypto"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const DEFAULT_PRODUCTS = ["BTC-USD", "ETH-USD", "SOL-USD"]
const DEFAULT_TIMEFRAME = "1d"
const COINBASE_API_BASE = "https://api.exchange.coinbase.com"

type CoinbaseCandleResponse = [number, number, number, number, number, number]

type TimeframeConfig = {
    granularity: number
    limit: number
}

const TIMEFRAMES: Record<string, TimeframeConfig> = {
    "1h": { granularity: 60, limit: 60 },
    "24h": { granularity: 900, limit: 96 },
    "1w": { granularity: 21600, limit: 112 },
    "1m": { granularity: 86400, limit: 30 },
    "3m": { granularity: 86400, limit: 90 },
    "6m": { granularity: 86400, limit: 180 },
    "1y": { granularity: 86400, limit: 365 }
}

function coinbaseSign(params: { secret: string, timestamp: string, method: string, requestPath: string, body?: string }) {
    const body = params.body ?? ""
    const prehash = params.timestamp + params.method.toUpperCase() + params.requestPath + body
    const key = Buffer.from(params.secret, "base64")
    return crypto.createHmac("sha256", key).update(prehash).digest("base64")
}

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(request.url)
    const productsParam = searchParams.get("products")
    const timeframeParam = searchParams.get("timeframe") ?? DEFAULT_TIMEFRAME

    const timeframe = TIMEFRAMES[timeframeParam] ?? TIMEFRAMES[DEFAULT_TIMEFRAME]
    const products = productsParam ? productsParam.split(",").map((product) => product.trim()).filter(Boolean) : DEFAULT_PRODUCTS

    const results = await Promise.allSettled(
        products.map(async (product) => {
            const timestamp = Math.floor(Date.now() / 1000).toString()

            const signature = coinbaseSign({
                secret: process.env.COINBASE_CLIENT_SECRET!,
                timestamp,
                method: "GET",
                requestPath: `/products/${product}/candles`,
                body: "",
            })

            const candlesResponse = await fetch(`${COINBASE_API_BASE}/products/${product}/candles?granularity=${timeframe.granularity}`, {
                headers: {
                    "User-Agent": "Forge (tryforge.io)",
                    "CB-ACCESS-KEY": process.env.COINBASE_CLIENT_ID!!,
                    "CB-ACCESS-PASSPHRASE": process.env.COINBASE_CLIENT_SECRET!!,
                    "CB-ACCESS-SIGN": signature,
                    "CB-ACCESS-TIMESTAMP": timestamp
                },
                cache: "no-store"
            })

            if (!candlesResponse.ok) throw new Error(`Failed to fetch Coinbase candles for ${product}`)

            const candles = (await candlesResponse.json()) as CoinbaseCandleResponse[]

            const orderedCandles = candles.slice(0, timeframe.limit).reverse()
            if (orderedCandles.length === 0) throw new Error(`No candle data returned for ${product}`)

            const [base, quote] = product.split("-")
            const latestClose = orderedCandles[orderedCandles.length - 1][4]
            const firstOpen = orderedCandles[0][3]
            const changePercent = firstOpen ? ((latestClose - firstOpen) / firstOpen) * 100 : 0

            return {
                product,
                base,
                quote,
                price: latestClose,
                changePercent,
                candles: orderedCandles.map((candle) => ({
                    time: candle[0],
                    low: candle[1],
                    high: candle[2],
                    open: candle[3],
                    close: candle[4]
                }))
            }
        })
    )

    return NextResponse.json(
        results.map((result, index) => result.status === "fulfilled"
            ? result.value
            : { product: products[index], error: "Unable to load price data." }
        )
    )
}
