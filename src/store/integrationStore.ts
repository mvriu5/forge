import {create} from "zustand/react"
import {Account} from "@/database"
import {authClient} from "@/lib/auth-client"

interface Integration {
    id: string
    accountId: string
    userId: string
    provider: string
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiration: Date | null
    refreshTokenExpiration: Date | null
    createdAt: Date
}

interface IntegrationStore {
    integrations: Integration[] | null
    fetchIntegrations: (userId: string) => Promise<void>
    addIntegration: (userId: string) => void
    removeIntegration: (provider: string) => Promise<void>
    updateIntegration: (provider: string, userId: string, data: Integration) => void
    githubIntegration: Integration | null
    googleIntegration: Integration | null
    linearIntegration: Integration | null
}


export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
    integrations: null,
    githubIntegration: null,
    googleIntegration: null,
    linearIntegration: null,
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
                refreshToken: account.refreshToken,
                idToken: account.idToken,
                accessTokenExpiration: account.accessTokenExpiresAt,
                refreshTokenExpiration: account.refreshTokenExpiresAt,
                createdAt: account.createdAt
            }))
            console.log("Fetched integrations:", integrations)

            set({
                integrations,
                githubIntegration: integrations.find(i => i.accessToken && i.provider === 'github') ?? null,
                googleIntegration: integrations.find(i => i.accessToken && i.provider === 'google') ?? null,
                linearIntegration: integrations.find(i => i.accessToken && i.provider === 'linear') ?? null
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
                googleIntegration: provider === "google" ? null : state.googleIntegration,
                linearIntegration: provider === "linear" ? null : state.linearIntegration,
            }
        })
    },
    updateIntegration: async (provider, userId, data) => {
        try {
            const response = await fetch(`/api/accounts?userId=${userId}&provider=${provider}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            await response.json()
            await get().fetchIntegrations(userId)
        } catch (error) {
            set({ integrations: get().integrations })
        }
    }
}))