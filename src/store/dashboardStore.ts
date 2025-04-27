import {Dashboard, DashboardInsert} from "@/database"
import {create} from "zustand/react"

interface DashboardStore {
    dashboards: Dashboard[] | null
    currentDashboard: Dashboard | null
    addDashboard: (userId: string, dashboard: DashboardInsert) => Promise<Dashboard>
    refreshDashboard: (dashboard: Dashboard) => Promise<void>
    removeDashboard: (dashboard: Dashboard) => Promise<void>
    getAllDashboards: (userId: string) => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    dashboards: null,

    currentDashboard: null,

    addDashboard: async (userId: string, dashboard: DashboardInsert) => {
        const dashboardWithUser = { ...dashboard, userId }
        try {
            const response = await fetch("/api/dashboards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dashboardWithUser)
            })
            const newDashboard = await response.json()
            set({ dashboards: [...(get().dashboards || []), newDashboard[0]], currentDashboard: newDashboard[0] })
            return newDashboard
        } catch (error) {
            set({ dashboards: get().dashboards })
        }
    },

    refreshDashboard: async (dashboard: Dashboard) => {
        try {
            const response = await fetch(`/api/dashboards?id=${dashboard.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dashboard)
            })
            const updatedDashboard = await response.json()
            set({
                dashboards: get().dashboards!.map((w) => w.id === updatedDashboard[0].id ? updatedDashboard[0] : w),
                currentDashboard: get().dashboards && get().currentDashboard?.id === dashboard.id ? updatedDashboard[0] : get().currentDashboard
            })
        } catch (error) {
            set({ dashboards: get().dashboards })
        }
    },

    removeDashboard: async (dashboard: Dashboard) => {
        try {
            await fetch(`/api/dashboards?id=${dashboard.id}`, { method: "DELETE" })

            const updatedList = get().dashboards?.filter(w => w.id !== dashboard.id)

            set({
                dashboards: updatedList,
                currentDashboard: updatedList && get().currentDashboard?.id === dashboard.id ? updatedList[0] : get().currentDashboard,
            })
        } catch (error) {
            set({ dashboards: get().dashboards })
        }
    },

    getAllDashboards: async (userId: string) => {
        try {
            const response = await fetch(`/api/dashboards?userId=${userId}`)
            const dashboards = await response.json()
            set({ dashboards, currentDashboard: dashboards && dashboards.length > 0 ? dashboards[0] : null })
        } catch (error) {
            set({ dashboards: get().dashboards })
        }
    }
}))