"use client"

import {ReactNode} from "react"
import {ToastProvider} from "@/components/ui/ToastProvider"
import {TooltipProvider} from "@/components/ui/TooltipProvider"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

function Providers({children}: {children: ReactNode}) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </TooltipProvider>
        </QueryClientProvider>
    )
}

export {Providers}