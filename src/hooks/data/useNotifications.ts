"use client"

import { useCallback, useEffect, useState } from "react"
import type { Notification } from "@/database"
import { toast } from "@/components/ui/Toast"
import { useRealtime } from "@/lib/realtime-client"

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

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev
            const next = [...prev, notification]
            return next.slice(-100)
        })
    }, [])

    const { status } = useRealtime({
        enabled: !!userId,
        channels: userId ? [`user-${userId}`] : [],
        events: ["notification.created"],
        onData: ({ data }) => {
            if (!data?.id) return
            addNotification({ ...data, createdAt: new Date(data.createdAt) })
        },
    })

    useEffect(() => {
        if (!userId) return

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
        })()

        return () => controller.abort()
    }, [userId])

    const connected = status === "connected"

    const sendReminderNotification = useCallback(async (input: { type: Notification["type"], message: string, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? `reminder-${input.message}`
        if (hasNotificationBeenSent(notificationKey)) return

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
            addNotification({ ...created, createdAt: new Date(created.createdAt) })
            markNotificationSent(notificationKey)
            toast.reminder(input.message)
        }
    }, [userId, addNotification])

    const sendMeetingNotification = useCallback(async (input: { type: Notification["type"], message: string, url: string, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? `meeting-${input.message}`
        if (hasNotificationBeenSent(notificationKey)) return

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
            addNotification({ ...created, createdAt: new Date(created.createdAt) })
            markNotificationSent(notificationKey)
            toast.meeting(input.message, input.url)
        }
    }, [userId, addNotification])

    const sendGithubNotification = useCallback(async (input: { type: Notification["type"], message: string, issues: number, pullRequests: number, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? "github-reminder"
        if (hasNotificationBeenSent(notificationKey)) return

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
            addNotification({ ...created, createdAt: new Date(created.createdAt) })
            markNotificationSent(notificationKey)
            toast.github(input.message, input.issues, input.pullRequests)
        }
    }, [userId, addNotification])

    const sendMailNotification = useCallback(async (input: { type: Notification["type"], id: string,  message: string, snippet: string, key?: string }) => {
        if (!userId) return

        const notificationKey = input.key ?? `mail-${input.id}`
        if (hasNotificationBeenSent(notificationKey)) return

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
            addNotification({ ...created, createdAt: new Date(created.createdAt) })
            markNotificationSent(notificationKey)
            toast.mail(input.message, input.snippet)
        }
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
        sendMailNotification,
        clearNotifications
    }
}
