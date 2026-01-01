import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Settings} from "@/database"
import { queryOptions } from "@/lib/queryOptions"

const SETTINGS_QUERY_KEY = (userId: string | undefined) => ["settings", userId] as const

const DEFAULT_SETTINGS = {
    theme: "system",
    hourFormat: "24",
    timezone: "UTC",
    todoReminder: false,
    countdownReminder: false,
    githubReminder: false,
    meetingReminders: [],
    deleteTodos: false
}

async function fetchSettings(userId: string): Promise<Settings | null> {
    const response = await fetch(`/api/settings?userId=${userId}`)

    if (response.ok) {
        const settings = await response.json()
        if (settings[0]) return settings[0]
    }

    const createRes = await fetch("/api/settings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userId, config: DEFAULT_SETTINGS}),
    })

    if (!createRes.ok) {
        throw new Error("Failed to create settings")
    }

    const newSettings = await createRes.json()
    return newSettings[0]
}

async function updateSettingsRequest(settings: Settings): Promise<Settings> {
    const response = await fetch(`/api/settings?id=${settings.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(settings)
    })

    if (!response.ok) {
        throw new Error("Failed to update settings")
    }

    const data = await response.json()
    return data[0]
}

export function useSettings(userId: string | undefined) {
    const queryClient = useQueryClient()

    const settingsQuery = useQuery(queryOptions({
        queryKey: SETTINGS_QUERY_KEY(userId),
        queryFn: () => fetchSettings(userId!),
        enabled: Boolean(userId)
    }))

    const updateSettingsMutation = useMutation({
        mutationFn: updateSettingsRequest,
        onSuccess: (updatedSettings) => {
            queryClient.setQueryData(SETTINGS_QUERY_KEY(userId), updatedSettings)
        }
    })

    return {
        settings: settingsQuery.data ?? null,
        isLoading: settingsQuery.isLoading,
        refetchSettings: settingsQuery.refetch,
        updateSettings: (settings: Settings) => updateSettingsMutation.mutateAsync(settings),
        updateSettingsStatus: updateSettingsMutation.status,
    }
}
