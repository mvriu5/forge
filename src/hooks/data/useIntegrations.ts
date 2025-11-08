import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Account} from "@/database"
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

const INTEGRATIONS_QUERY_KEY = (userId: string | undefined) => ["integrations", userId] as const

async function fetchIntegrations(userId: string): Promise<Integration[]> {
    const response = await fetch(`/api/accounts?userId=${userId}`)

    if (!response.ok) return []

    const accounts: Account[] = await response.json()

    return accounts
        .filter((account): account is Account => !!account)
        .map((account) => ({
            id: account.id,
            accountId: account.accountId,
            userId: account.userId,
            provider: account.providerId,
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
            idToken: account.idToken,
            accessTokenExpiration: account.accessTokenExpiresAt,
            refreshTokenExpiration: account.refreshTokenExpiresAt,
            createdAt: account.createdAt,
        }))
}

async function unlinkIntegration(provider: string) {
    await authClient.unlinkAccount({ providerId: provider })
}

interface UpdateIntegrationArgs {
    provider: string
    userId: string
    data: Partial<Integration>
}

async function updateIntegrationRequest({provider, userId, data}: UpdateIntegrationArgs): Promise<Integration> {
    const response = await fetch(`/api/accounts?userId=${userId}&provider=${provider}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        throw new Error("Failed to update integration")
    }

    const result = await response.json()
    return result[0]
}

export function useIntegrations(userId: string | undefined) {
    const queryClient = useQueryClient()

    const integrationsQuery = useQuery({
        queryKey: INTEGRATIONS_QUERY_KEY(userId),
        queryFn: () => fetchIntegrations(userId!),
        enabled: !!userId,
        initialData: [] as Integration[],
    })

    const refetchIntegrations = integrationsQuery.refetch

    const removeIntegrationMutation = useMutation({
        mutationFn: unlinkIntegration,
        onSuccess: (_, provider) => {
            queryClient.setQueryData(INTEGRATIONS_QUERY_KEY(userId), (previous: Integration[] | undefined) => {
                if (!previous) return previous
                return previous.filter((integration) => integration.provider !== provider)
            })
        }
    })

    const updateIntegrationMutation = useMutation({
        mutationFn: updateIntegrationRequest,
        onSuccess: (updatedIntegration) => {
            queryClient.setQueryData(INTEGRATIONS_QUERY_KEY(userId), (previous: Integration[] | undefined) => {
                if (!previous) return [updatedIntegration]
                return previous.map((integration) => integration.provider === updatedIntegration.provider ? updatedIntegration : integration)
            })
        }
    })

    return {
        integrations: integrationsQuery.data ?? [],
        isLoading: integrationsQuery.isLoading,
        refetchIntegrations,
        removeIntegration: (provider: string) => removeIntegrationMutation.mutateAsync(provider),
        removeIntegrationStatus: removeIntegrationMutation.status,
        updateIntegration: (args: UpdateIntegrationArgs) => updateIntegrationMutation.mutateAsync(args),
        updateIntegrationStatus: updateIntegrationMutation.status,
    }
}

export function getIntegrationByProvider(integrations: Integration[], provider: string) {
    return integrations.find((integration) => integration.provider === provider) ?? null
}