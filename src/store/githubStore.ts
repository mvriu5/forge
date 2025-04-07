import { create } from "zustand"
import { persist } from "zustand/middleware"

interface GithubData {
    issues: any[]
    pullRequests: any[]
    lastFetched: number | null
}

interface GithubStore {
    data: GithubData
    loading: boolean
    setLoading: (loading: boolean) => void
    setData: (data: Partial<GithubData>) => void
    clearData: () => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useGithubStore = create<GithubStore>()(
    persist((set) => ({
        data: {
            issues: [],
            pullRequests: [],
            lastFetched: null
        },
        loading: false,
        setLoading: (loading) => set({ loading }),
        setData: (newData) => set((state) => ({
            data: {
                ...state.data,
                ...newData,
                lastFetched: Date.now()
            }
        })),
        clearData: () => set({
            data: {
                issues: [],
                pullRequests: [],
                lastFetched: null
            }})
        }),
        {
            name: "github-data-storage",
            partialize: (state) => ({
                data: state.data
            })
        }
    )
)

export const shouldRefetchData = (lastFetched: number | null): boolean => {
    if (!lastFetched) return true
    return Date.now() - lastFetched > CACHE_DURATION
}

