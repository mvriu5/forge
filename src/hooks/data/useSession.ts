import {useQuery, useQueryClient} from "@tanstack/react-query"
import type {Session} from "@/lib/auth"

const SESSION_QUERY_KEY = ["session"] as const

async function fetchSession(): Promise<Session | null> {
    const response = await fetch("/api/auth/get-session")

    if (!response.ok) return null

    const data = await response.json()
    return data ?? null
}

export function useSession() {
    const queryClient = useQueryClient()

    const sessionQuery = useQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: fetchSession,
    })

    const setSession = (session: Session | null) => {
        queryClient.setQueryData(SESSION_QUERY_KEY, session)
    }

    const updateUser = (update: Partial<Session["user"]>) => {
        queryClient.setQueryData(SESSION_QUERY_KEY, (previous: Session | null | undefined) => {
            if (!previous) return previous ?? null
            return {
                ...previous,
                user: {
                    ...previous.user,
                    ...update,
                }
            }
        })
    }

    return {
        session: sessionQuery.data ?? null,
        isLoading: sessionQuery.isLoading,
        refetchSession: sessionQuery.refetch,
        setSession,
        updateUser,
    }
}