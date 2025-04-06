import {create} from "zustand/react"
import {Account} from "@/database"
import {authClient} from "@/lib/auth-client"

interface Integration {
    id: string
    accountId: string
    userId: string
    provider: string
    accessToken: string | null
    createdAt: Date
}

interface IntegrationStore {
    integrations: Integration[] | null
    fetchIntegrations: (userId: string) => Promise<void>
    addIntegration: (userId: string) => void
    removeIntegration: (provider: string) => Promise<void>
    githubIntegration: Integration | null
    googleIntegration: Integration | null
}


export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
    integrations: null,
    githubIntegration: null,
    googleIntegration: null,
    fetchIntegrations: async (userId) => {
        try {
            const response = await fetch(`/api/accounts?userId=${userId}`)
            if (!response.ok) return

            const accounts: Account[] = await response.json()

            const integrations = accounts.map(account => ({
                id: account.id,
                accountId: account.accountId,
                userId: account.userId,
                provider: account.providerId,
                accessToken: account.accessToken,
                createdAt: account.createdAt
            }))

            set({
                integrations,
                githubIntegration: integrations.find(i => i.accessToken && i.provider === 'github') ?? null,
                googleIntegration: integrations.find(i => i.accessToken && i.provider === 'google') ?? null,
            })
        } catch (error) {
            set({ integrations: null })
        }
    },
    addIntegration: async (userId) => {
        await get().fetchIntegrations(userId)
    },
    removeIntegration: async (provider) => {
        await authClient.unlinkAccount({
            providerId: provider
        })
        set((state) => {
            const updatedIntegrations = state.integrations
                ? state.integrations.filter((integration) => integration.provider !== provider)
                : []
            return {
                integrations: updatedIntegrations,
                githubIntegration: provider === "github" ? null : state.githubIntegration,
                googleIntegration: provider === "google" ? null : state.googleIntegration
            }
        })
    }
}))