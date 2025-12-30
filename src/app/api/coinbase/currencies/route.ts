import { NextResponse } from "next/server"
import crypto from "crypto"

const COINBASE_API_BASE = "https://api.exchange.coinbase.com"

type CoinbaseCurrency = {
    id: string
    name: string
    status: string
    details?: {
        type?: string
    }
}

function coinbaseSign(params: { secret: string, timestamp: string, method: string, requestPath: string, body?: string }) {
    const body = params.body ?? ""
    const prehash = params.timestamp + params.method.toUpperCase() + params.requestPath + body
    const key = Buffer.from(params.secret, "base64")
    return crypto.createHmac("sha256", key).update(prehash).digest("base64")
}

export async function GET() {
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const signature = coinbaseSign({
        secret: process.env.COINBASE_CLIENT_SECRET!,
        timestamp,
        method: "GET",
        requestPath: `/currencies`,
        body: "",
    })

    const response = await fetch(`${COINBASE_API_BASE}/currencies`, {
        headers: {
            "User-Agent": "Forge (tryforge.io)",
            "CB-ACCESS-KEY": process.env.COINBASE_CLIENT_ID!!,
            "CB-ACCESS-PASSPHRASE": process.env.COINBASE_CLIENT_SECRET!!,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp
        },
        cache: "no-store"
    })

    if (!response.ok) {
        return NextResponse.json({ error: "Unable to load Coinbase currencies." }, { status: 502 })
    }

    const data = (await response.json()) as CoinbaseCurrency[]
    const currencies = data
        .filter((currency) => currency.status === "online")
        .filter((currency) => currency.details?.type === "crypto")
        .map((currency) => ({
            id: currency.id,
            name: currency.name
        }))
        .sort((a, b) => a.id.localeCompare(b.id))

    return NextResponse.json(currencies)
}
