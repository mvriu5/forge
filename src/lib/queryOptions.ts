import { UseQueryOptions } from "@tanstack/react-query"

export function queryOptions<TData, TError = Error>(
    options?: Pick<UseQueryOptions<TData, TError>, "queryKey" | "queryFn" | "enabled" | "select">
): UseQueryOptions<TData, TError> {
    return {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 3,
        ...options
    } as any as UseQueryOptions<TData, TError>
}
