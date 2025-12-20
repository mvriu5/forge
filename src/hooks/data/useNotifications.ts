"use client"

import {useCallback, useEffect, useState} from "react"
import type { Notification } from "@/database"
import {toast} from "@/components/ui/Toast"

const NOTIFICATION_SENT_KEY = "forge-notifications-session"

const getSentNotifications = (): Set<string> => {
    if (typeof window === "undefined") return new Set()
    try {
        const stored = sessionStorage.getItem(NOTIFICATION_SENT_KEY)
        return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
        return new Set()
    }
}

const markNotificationSent = (key: string): void => {
    if (typeof window === "undefined") return
    try {
        const sent = getSentNotifications()
        sent.add(key)
        sessionStorage.setItem(NOTIFICATION_SENT_KEY, JSON.stringify([...sent]))
    } catch {
        // Ignore storage errors
    }
}

const hasNotificationBeenSent = (key: string): boolean => {
    return getSentNotifications().has(key)
}

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [connected, setConnected] = useState(false)

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev
            const next = [...prev, notification]
            return next.slice(-100)
        })
    }, [])

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

                    addNotification({...notification, createdAt: new Date(notification.createdAt)})
                } catch (error) {
                }
            }
        })()

        return () => {
            controller.abort()
            es?.close()
        }
    }, [userId])

    const sendReminderNotification = useCallback(async (input: { type: Notification["type"], message: string, key?: string }) => {
        if (!userId) return

        // Deduplicate by key if provided
        const notificationKey = input.key ?? `reminder-${input.message}`
        if (hasNotificationBeenSent(notificationKey)) return

        markNotificationSent(notificationKey)

        const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                type: input.type,
                message: input.message,
            })
        })
        if (res.ok) {
            const created = await res.json() as Notification
            addNotification({...created, createdAt: new Date(created.createdAt)})
        }
        toast.reminder(input.message)
    }, [userId, addNotification])

    const sendMeetingNotification = useCallback(async (input: { type: Notification["type"], message: string, url: string, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? `meeting-${input.message}`
        if (hasNotificationBeenSent(notificationKey)) return

        markNotificationSent(notificationKey)

        const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                type: input.type,
                message: input.message,
            })
        })
        if (res.ok) {
            const created = await res.json() as Notification
            addNotification({...created, createdAt: new Date(created.createdAt)})
        }
        toast.meeting(input.message, input.url)
    }, [userId, addNotification])

    const sendGithubNotification = useCallback(async (input: { type: Notification["type"], message: string, issues: number, pullRequests: number, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? "github-reminder"
        if (hasNotificationBeenSent(notificationKey)) return

        markNotificationSent(notificationKey)

        const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                type: input.type,
                message: input.message,
            })
        })
        if (res.ok) {
            const created = await res.json() as Notification
            addNotification({...created, createdAt: new Date(created.createdAt)})
        }
        toast.github(input.message, input.issues, input.pullRequests)
    }, [userId, addNotification])

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
