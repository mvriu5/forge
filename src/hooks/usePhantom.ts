"use client"

import {useQuery} from "@tanstack/react-query"
import {Balance, fetchHeliusBalance} from "@/actions/helius"
import {useCallback, useEffect, useState} from "react"

interface Wallet {
    address: string
    balance: { value: number }
}

interface PhantomProvider {
    isPhantom: boolean
    publicKey: { toBase58(): string }
    isConnected?: boolean
    connect(): Promise<{ publicKey: { toBase58(): string } }>
    disconnect(): Promise<void>
    on?(event: "connect" | "disconnect", handler: () => void): void
}

const usePhantom = () => {
    const [provider, setProvider] = useState<PhantomProvider | null>(null)
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [connecting, setConnecting] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const sol = (window as any).solana as PhantomProvider | undefined
        if (sol?.isPhantom) {
            setProvider(sol)
            if (sol.isConnected) {
                const addr = sol.publicKey.toBase58()
                setWallet({ address: addr, balance: { value: 0 } })
            }
            sol.on?.("connect", () => {
                const addr = sol.publicKey.toBase58()
                setWallet({ address: addr, balance: { value: 0 } })
            })
            sol.on?.("disconnect", () => {
                setWallet(null)
            })
        }
    }, [])

    const connect = useCallback(async () => {
        if (!provider || connecting) return
        setConnecting(true)

        try {
            if (provider.isConnected) await provider.disconnect()
            const { publicKey } = await provider.connect()
            const addr = publicKey.toBase58()
            setWallet({ address: addr, balance: { value: 0 } })
        } catch (error: any) {
        } finally {
            setConnecting(false)
        }
    }, [provider, connecting])

    const disconnect = useCallback(async () => {
        if (!provider) return
        await provider.disconnect()
        setWallet(null)
    }, [provider])

    const {data, isLoading, isFetching, isError, refetch,} = useQuery<Balance>({
        queryKey: ["heliusBalance", wallet?.address],
        queryFn: async () => await fetchHeliusBalance(wallet!.address),
        enabled: !!wallet?.address,
        staleTime: 5 * 60 * 1000, //5 minutes
        refetchInterval: 5 * 60 * 1000 //5 minutes
    })

    useEffect(() => {
        if (data) setWallet({ address: wallet?.address!, balance: data })
    }, [data])

    return {
        provider,
        wallet,
        connect,
        disconnect,
        isLoading,
        isFetching,
        isError,
        refetch,
    }
}

export { usePhantom, type Wallet }
