import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Dashboard, DashboardInsert, Settings} from "@/database"
import {useMemo, useState} from "react"
import { queryOptions } from "@/lib/queryOptions"
import { apiCommand, apiRequest } from "@/lib/api-client"

const DASHBOARD_QUERY_KEY = (userId: string | undefined) => ["dashboards", userId] as const

async function fetchDashboards(userId: string): Promise<Dashboard[]> {
    return apiRequest<Dashboard[]>(`/api/dashboards?userId=${userId}`)
}

async function createDashboard(userId: string, dashboard: DashboardInsert): Promise<Dashboard> {
    const data = await apiRequest<Dashboard[]>("/api/dashboards", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...dashboard, userId})
    })

    return data[0]
}

async function updateDashboardRequest(dashboard: Dashboard): Promise<Dashboard> {
    const data = await apiRequest<Dashboard[]>(`/api/dashboards?id=${dashboard.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dashboard)
    })

    return data[0]
}

async function deleteDashboardRequest(id: string): Promise<void> {
    await apiCommand(`/api/dashboards?id=${id}`, {method: "DELETE"})
}

export function useDashboards(userId: string | undefined, settings: Settings | null) {
    const queryClient = useQueryClient()

    const dashboardsQuery = useQuery(queryOptions({
        queryKey: DASHBOARD_QUERY_KEY(userId),
        queryFn: () => fetchDashboards(userId!),
        enabled: Boolean(userId)
    }))

    const addDashboardMutation = useMutation({
        mutationFn: (input: DashboardInsert) => createDashboard(userId!, input),
        onSuccess: (dashboard) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return [dashboard]
                return [...previous, dashboard]
            })
        }
    })

    const refreshDashboardMutation = useMutation({
        mutationFn: updateDashboardRequest,
        onSuccess: (updatedDashboard) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return previous
                return previous.map((dashboard) => dashboard.id === updatedDashboard.id ? updatedDashboard : dashboard)
            })
        }
    })

    const removeDashboardMutation = useMutation({
        mutationFn: deleteDashboardRequest,
        onSuccess: (_, dashboardId) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return previous
                return previous.filter((dashboard) => dashboard.id !== dashboardId)
            })
        }
    })

    const [localSelectedDashboardId, setLocalSelectedDashboardId] = useState<string | null>(null)

    const currentDashboard = useMemo(() => {
        if (!dashboardsQuery.data || dashboardsQuery.data.length === 0) return null

        if (localSelectedDashboardId) {
            return dashboardsQuery.data.find((d) => d.id === localSelectedDashboardId) ?? dashboardsQuery.data[0]
        }

        const openId = settings?.config?.openDashboard
        if (openId && openId !== "None") {
            return dashboardsQuery.data.find((d) => d.id === openId) ?? dashboardsQuery.data[0]
        }

        if (settings?.lastDashboardId) {
            return dashboardsQuery.data.find((d) => d.id === settings.lastDashboardId) ?? dashboardsQuery.data[0]
        }

        return dashboardsQuery.data[0]
    }, [dashboardsQuery.data, settings, localSelectedDashboardId])

    return {
        dashboards: dashboardsQuery.data ?? null,
        currentDashboard,
        isLoading: dashboardsQuery.isLoading,
        refetchDashboards: dashboardsQuery.refetch,
        addDashboard: (input: DashboardInsert) => addDashboardMutation.mutateAsync(input),
        updateDashboard: (dashboard: Dashboard) => refreshDashboardMutation.mutateAsync(dashboard),
        removeDashboard: (dashboardId: string) => removeDashboardMutation.mutateAsync(dashboardId),
        setSelectedDashboard: (id: string | null) => setLocalSelectedDashboardId(id),
        addDashboardStatus: addDashboardMutation.status,
        updateDashboardStatus: refreshDashboardMutation.status,
        removeDashboardStatus: removeDashboardMutation.status,
    }
}
