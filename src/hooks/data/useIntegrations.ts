import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import type {Account} from "@/database"
import {authClient} from "@/lib/auth-client"
import {toast} from "sonner"
import {capitalizeFirstLetter} from "@better-auth/core/utils"
import posthog from "posthog-js"

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
const CALLBACK_URL = "/dashboard"

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
    await authClient.unlinkAccount({ providerId: provider }, {
        onError: (error) => {
             posthog.captureException(error, {
                method: "unlinkIntegration", provider
             })
        }
    })
}

interface UpdateIntegrationArgs {
    provider: string
    userId: string
    data: Partial<Integration>
}

async function updateIntegrationRequest({provider, userId, data}: UpdateIntegrationArgs): Promise<Integration> {
    const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...data, userId, provider})
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
        },
        onError: (error, provider) => posthog.captureException(error, {
            hook: "useIntegrations.deleteIntegration", userId, provider
        })
    })

    const updateIntegrationMutation = useMutation({
        mutationFn: updateIntegrationRequest,
        onSuccess: (updatedIntegration) => {
            queryClient.setQueryData(INTEGRATIONS_QUERY_KEY(userId), (previous: Integration[] | undefined) => {
                if (!previous) return [updatedIntegration]
                return previous.map((integration) => integration.provider === updatedIntegration.provider ? updatedIntegration : integration)
            })
        },
        onError: (error, updatedIntegration) => posthog.captureException(error, {
            hook: "useIntegrations.updateIntegration", userId, updatedIntegration
        })
    })

    const handleIntegrate = async (provider: string, callback = true) => {
        const data = await authClient.signIn.social({
            provider,
            callbackURL: callback ? CALLBACK_URL : undefined,
        }, {
            onRequest: (ctx) => {
                void refetchIntegrations()
            },
            onSuccess: (ctx) => {
                toast.success("Successfully integrated " + capitalizeFirstLetter(provider))
            },
            onError: (ctx) => {
                toast.error("Something went wrong", {description: ctx.error.message})
                posthog.captureException(ctx.error, {
                    method: "handleIntegrate", userId, provider
                })
            }
        })
    }

    return {
        integrations: integrationsQuery.data ?? [],
        isLoading: integrationsQuery.isLoading,
        handleIntegrate,
        refetchIntegrations,
        removeIntegration: (provider: string) => removeIntegrationMutation.mutateAsync(provider),
        removeIntegrationStatus: removeIntegrationMutation.status,
        updateIntegration: (args: UpdateIntegrationArgs) => updateIntegrationMutation.mutateAsync(args),
        updateIntegrationStatus: updateIntegrationMutation.status,
    }
}

export function getIntegrationByProvider(integrations: Integration[], provider: string | undefined) {
    if (!provider) return null
    return integrations.find((integration) => integration.provider === provider) ?? null
}