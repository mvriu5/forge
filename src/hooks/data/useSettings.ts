import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Settings} from "@/database"
import { queryOptions } from "@/lib/queryOptions"
import { ApiError, apiRequest } from "@/lib/api-client"

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
    try {
        const settings = await apiRequest<Settings[]>(`/api/settings?userId=${userId}`)
        if (settings[0]) return settings[0]
    } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) throw error
    }

    const newSettings = await apiRequest<Settings[]>("/api/settings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userId, config: DEFAULT_SETTINGS}),
    })

    return newSettings[0]
}

async function updateSettingsRequest(settings: Settings): Promise<Settings> {
    const data = await apiRequest<Settings[]>(`/api/settings?id=${settings.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(settings)
    })

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
            queryClient.setQueryData(SETTINGS_QUERY_KEY(updatedSettings.userId), updatedSettings)
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
