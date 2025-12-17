"use client"

import {useCallback, useEffect, useState} from "react"
import type { Notification } from "@/database"
import {toast} from "@/components/ui/Toast"

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!userId) return

        let es: EventSource | null = null
        const controller = new AbortController();

        (async () => {
            try {
                const res = await fetch(`/api/notifications?userId=${userId}`, { signal: controller.signal })
                if (!res.ok) return

                const initial: Notification[] = await res.json()
                setNotifications(initial.slice(-100))
            } catch (error) {
                return
            }

            es = new EventSource(`/api/notifications/stream?userId=${userId}`)
            es.onopen = () => setConnected(true)
            es.onerror = () => {
                setConnected(false)
                es?.close()
            }
            es.onmessage = (event) => {
                const jsonStart = event.data.indexOf("{")
                if (jsonStart === -1) return

                const payload = event.data.slice(jsonStart)

                try {
                    const notification = JSON.parse(payload) as Notification

                    if (!notification?.id) return

                    setNotifications((prev) => {
                        if (prev.some((item) => item.id === notification.id)) return prev
                        const next = [...prev, notification]
                        return next.slice(-100)
                    })
                } catch (error) {
                }
            }
        })()

        return () => {
            controller.abort()
            es?.close()
        }
    }, [userId])

    const sendReminderNotification = useCallback(async (input: { type: Notification["type"], message: string }) => {
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
        toast.reminder(input.message)
    }, [userId])

    const sendMeetingNotification = useCallback(async (input: { type: Notification["type"], message: string, url: string }) => {
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
        toast.meeting(input.message, input.url)
    }, [userId])

    const sendGithubNotification = useCallback(async (input: { type: Notification["type"], message: string, issues: number, pullRequests: number }) => {
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
        toast.github(input.message, input.issues, input.pullRequests)
    }, [userId])

    const clearNotifications = useCallback(async () => {
        if (!userId) return

        await fetch(`/api/notifications?userId=${userId}`, { method: "DELETE" })
        setNotifications([])
    }, [userId])

    return {
        notifications,
        connected,
        sendReminderNotification,
        sendMeetingNotification,
        sendGithubNotification,
        clearNotifications
    }
}
