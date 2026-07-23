import { auth } from "@/lib/auth"
import crypto from "crypto"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const apiKey = process.env.COINBASE_CLIENT_ID
    const apiSecret = process.env.COINBASE_CLIENT_SECRET
    const passphrase = process.env.COINBASE_PASSPHRASE

    if (!apiKey || !apiSecret || !passphrase) {
        return NextResponse.json({ error: "Coinbase credentials are not configured." }, { status: 503 })
    }

    const timestamp = Math.floor(Date.now() / 1000).toString()

    const signature = coinbaseSign({
        secret: apiSecret,
        timestamp,
        method: "GET",
        requestPath: `/currencies`,
        body: "",
    })

    const response = await fetch(`${COINBASE_API_BASE}/currencies`, {
        headers: {
            "User-Agent": "Forge (tryforge.io)",
            "CB-ACCESS-KEY": apiKey,
            "CB-ACCESS-PASSPHRASE": passphrase,
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
