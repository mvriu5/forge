import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Dashboard, DashboardInsert, Settings} from "@/database"
import {useMemo} from "react"
import posthog from "posthog-js"
import {context} from "esbuild"

const DASHBOARD_QUERY_KEY = (userId: string | undefined) => ["dashboards", userId] as const

async function fetchDashboards(userId: string): Promise<Dashboard[]> {
    const response = await fetch(`/api/dashboards?userId=${userId}`)

    if (!response.ok) {
        throw new Error("Failed to fetch dashboards")
    }

    return response.json()
}

async function createDashboard(userId: string, dashboard: DashboardInsert): Promise<Dashboard> {
    const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...dashboard, userId})
    })

    if (!response.ok) {
        throw new Error("Failed to create dashboard")
    }

    const data = await response.json()
    return data[0]
}

async function updateDashboardRequest(dashboard: Dashboard): Promise<Dashboard> {
    const response = await fetch(`/api/dashboards?id=${dashboard.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dashboard)
    })

    if (!response.ok) {
        throw new Error("Failed to update dashboard")
    }

    const data = await response.json()
    return data[0]
}

async function deleteDashboardRequest(id: string): Promise<void> {
    const response = await fetch(`/api/dashboards?id=${id}`, {method: "DELETE"})

    if (!response.ok) {
        throw new Error("Failed to delete dashboard")
    }
}

export function useDashboards(userId: string | undefined, settings: Settings | null) {
    const queryClient = useQueryClient()

    const dashboardsQuery = useQuery({
        queryKey: DASHBOARD_QUERY_KEY(userId),
        queryFn: () => fetchDashboards(userId!),
        enabled: !!userId
    })

    const addDashboardMutation = useMutation({
        mutationFn: (input: DashboardInsert) => createDashboard(userId!, input),
        onSuccess: (dashboard) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return [dashboard]
                return [...previous, dashboard]
            })
        },
        onError: (error, input) => posthog.captureException(error, {
            hook: "useDashboards.addDashboard", userId, input
        })
    })

    const refreshDashboardMutation = useMutation({
        mutationFn: updateDashboardRequest,
        onSuccess: (updatedDashboard) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return previous
                return previous.map((dashboard) => dashboard.id === updatedDashboard.id ? updatedDashboard : dashboard)
            })
        },
        onError: (error, updatedDashboard) => posthog.captureException(error, {
            hook: "useDashboards.updateDashboard", userId, updatedDashboard
        })
    })

    const removeDashboardMutation = useMutation({
        mutationFn: deleteDashboardRequest,
        onSuccess: (_, dashboardId) => {
            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (previous: Dashboard[] | undefined) => {
                if (!previous) return previous
                return previous.filter((dashboard) => dashboard.id !== dashboardId)
            })
        },
        onError: (error, dashboardId) => posthog.captureException(error, {
            hook: "useDashboards.deleteDashboard", userId, dashboardId
        })
    })

    const currentDashboard = useMemo(() => {
        if (!settings) return null
        if (!dashboardsQuery.data || dashboardsQuery.data.length === 0) return null
        if (settings.lastDashboardId) {
            return dashboardsQuery.data.find((d) => d.id === settings.lastDashboardId) ?? dashboardsQuery.data[0]
        }
        return dashboardsQuery.data[0]
    }, [dashboardsQuery.data, settings])

    return {
        dashboards: dashboardsQuery.data ?? null,
        currentDashboard,
        isLoading: dashboardsQuery.isLoading,
        refetchDashboards: dashboardsQuery.refetch,
        addDashboard: (input: DashboardInsert) => addDashboardMutation.mutateAsync(input),
        updateDashboard: (dashboard: Dashboard) => refreshDashboardMutation.mutateAsync(dashboard),
        removeDashboard: (dashboardId: string) => removeDashboardMutation.mutateAsync(dashboardId),
        addDashboardStatus: addDashboardMutation.status,
        updateDashboardStatus: refreshDashboardMutation.status,
        removeDashboardStatus: removeDashboardMutation.status,
    }
}