"use client"

import { TooltipProvider } from "@/components/ui/TooltipProvider"
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RealtimeProvider } from "@upstash/realtime/client"
import { ThemeProvider } from "next-themes"
import { ReactNode, useEffect, useState } from "react"
import { Toaster } from "sonner"
import { toast } from "@/components/ui/Toast"

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                const status = error && typeof error === "object" && "status" in error
                    ? Number(error.status)
                    : 0
                return status < 400 || status >= 500 ? failureCount < 3 : false
            },
        },
    },
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.silentError) return
            toast.error(error.message || "The action could not be completed.")
        },
    }),
})

function Providers({children}: {children: ReactNode}) {
    const [mounted, setMounted] = useState(false)
    const [queryClient] = useState(createQueryClient)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <RealtimeProvider api={{ url: "/api/realtime", withCredentials: true }} maxReconnectAttempts={5}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        {mounted ? <Toaster theme="dark"/> : null}
                        {children}
                    </TooltipProvider>
                </ThemeProvider>
            </RealtimeProvider>
        </QueryClientProvider>
    )
}

export { Providers }
