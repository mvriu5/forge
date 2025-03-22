"use client"

import { useState, useEffect } from "react"
import type { Session } from "@/lib/auth"

export function useSession() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        async function fetchSession() {
            try {
                const response = await fetch("/api/auth/get-session")

                if (!response.ok) {
                    setSession(null)
                    return
                }

                const data = await response.json()

                if (!data || !data.user) {
                    setSession(null)
                    return
                }

                setSession(data)
            } catch (error) {
                console.error("Failed to fetch session:", error)
                setSession(null)
            }
        }

        fetchSession()
    }, [])

    return session
}