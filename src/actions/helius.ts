type Balance = { value: number }

async function fetchHeliusBalance(account: string): Promise<Balance> {
    const apiKey = process.env.HELIUS_API_KEY
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "test",
            "method": "getBalance",
            "params": [account]
        }),
        next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`Hélius-Fehler: ${res.status} ${res.statusText}`)

    const data = await res.json()
    return data.result as Balance
}

export {fetchHeliusBalance, type Balance}