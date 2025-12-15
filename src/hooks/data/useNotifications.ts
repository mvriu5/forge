"use client"

import {useCallback, useEffect, useState} from "react"
import type { Notification } from "@/database"

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!userId) return

        let es: EventSource | null = null;

        (async () => {
            const res = await fetch(`/api/notifications?userId=${userId}`)
            if (!res.ok) return

            const initial: Notification[] = await res.json()
            setNotifications(initial)

            es = new EventSource(`/api/notifications/stream?userId=${userId}`)
            es.onopen = () => setConnected(true)
            es.onerror = () => setConnected(false)
            es.onmessage = (event) => {
                const firstComma = event.data.indexOf(",")
                const secondComma = event.data.indexOf(",", firstComma + 1)

                if (firstComma === -1 || secondComma === -1) return

                const kind = event.data.slice(0, firstComma)
                if (kind !== "message") return

                const payload = event.data.slice(secondComma + 1)
                if (!payload || payload[0] !== "{") return

                try {
                    const notification = JSON.parse(payload) as Notification
                    setNotifications((prev) => [...prev, notification])
                } catch {
                    console.log("Failed to parse notification payload", payload)
                }
            }
        })()

        return () => es?.close()
    }, [userId])

    const sendNotification = useCallback(async (input: { type: Notification["type"], message: string, createdAt: string }) => {
        if (!userId) return

        await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                type: input.type,
                message: input.message,
            })
        })
    }, [userId])

    const clearNotifications = useCallback(async () => {
        if (!userId) return

        await fetch(`/api/notifications?userId=${userId}`, { method: "DELETE" })
        setNotifications([])
    }, [userId])

    return {
        notifications,
        connected,
        sendNotification,
        clearNotifications
    }
}
