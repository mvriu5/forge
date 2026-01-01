"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

export function PostHogInit() {
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
        if (!apiKey) return

        if (posthog.__loaded) return

        posthog.init(apiKey, {
            api_host: "https://eu.i.posthog.com",
            ui_host: "https://eu.posthog.com",
            defaults: "2025-11-30"
        })
    }, [])

    return null
}
