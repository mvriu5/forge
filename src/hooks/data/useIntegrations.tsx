"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {authClient} from "@/lib/auth-client"
import {toast} from "@/components/ui/Toast"
import { queryOptions } from "@/lib/queryOptions"
import { createContext, ReactNode, useCallback, useContext, useMemo } from "react"
import { apiCommand, apiRequest } from "@/lib/api-client"

export interface Integration {
    id: string
    accountId: string
    userId: string
    provider: string
    connected: boolean
    accessTokenExpiresAt: Date | null
    createdAt: Date
}

const INTEGRATIONS_QUERY_KEY = (userId: string | undefined) => ["integrations", userId] as const
const CALLBACK_URL = "/dashboard"

async function fetchIntegrations(userId: string): Promise<Integration[]> {
    return apiRequest<Integration[]>(`/api/accounts?userId=${userId}`)
}

async function unlinkIntegration(provider: string) {
    await apiCommand(`/api/accounts?provider=${provider}`, { method: "DELETE" })
}

type IntegrationsValue = {
    userId: string | undefined
    integrations: Integration[]
    isLoading: boolean
    handleIntegrate: (provider: string, callback?: boolean) => Promise<void>
    refetchIntegrations: () => Promise<unknown>
    removeIntegration: (provider: string) => Promise<void>
    removeIntegrationStatus: string
}

const IntegrationsContext = createContext<IntegrationsValue | null>(null)

export function IntegrationsProvider({children, value}: {children: ReactNode; value: IntegrationsValue}) {
    return <IntegrationsContext.Provider value={value}>{children}</IntegrationsContext.Provider>
}

export function useIntegrations(userId: string | undefined): IntegrationsValue {
    const context = useContext(IntegrationsContext)
    const queryClient = useQueryClient()
    const hasScopedContext = context?.userId === userId

    const integrationsQuery = useQuery<Integration[], Error>(queryOptions({
        queryKey: INTEGRATIONS_QUERY_KEY(userId),
        queryFn: () => fetchIntegrations(userId!),
        enabled: Boolean(userId) && !hasScopedContext,
    }))

    const { refetch: refetchIntegrations, data, isLoading } = integrationsQuery

    const isLoadingIntegrations = hasScopedContext ? context?.isLoading : isLoading && !data

    const removeIntegrationMutation = useMutation({
        mutationFn: unlinkIntegration,
        onSuccess: (_, provider) => {
            queryClient.setQueryData(INTEGRATIONS_QUERY_KEY(userId), (previous: Integration[] | undefined) => {
                if (!previous) return previous
                return previous.filter((integration) => integration.provider !== provider)
            })
        },
        onError: () => {
            toast.error("Could not disconnect integration.")
        }
    })

    const handleIntegrate = useCallback(async (provider: string, callback = true): Promise<void> => {
        await authClient.signIn.social({
            provider,
            callbackURL: callback ? CALLBACK_URL : undefined,
        }, {
            onRequest: () => {
                void refetchIntegrations()
            },
            onError: () => {
                toast.error("Something went wrong.")
            }
        })
    }, [refetchIntegrations])

    const fallbackValue: IntegrationsValue = useMemo(() => ({
        userId,
        integrations: data ?? [],
        isLoading: isLoadingIntegrations ?? false,
        handleIntegrate,
        refetchIntegrations,
        removeIntegration: (provider: string) => removeIntegrationMutation.mutateAsync(provider),
        removeIntegrationStatus: removeIntegrationMutation.status,
    }), [
        data,
        handleIntegrate,
        isLoadingIntegrations,
        refetchIntegrations,
        removeIntegrationMutation,
        userId,
    ])

    return hasScopedContext && context ? context : fallbackValue
}

export function getIntegrationByProvider(integrations: Integration[], provider: string | undefined) {
    if (!provider) return null
    return integrations.find((integration) => integration.provider === provider) ?? null
}
