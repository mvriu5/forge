"use client"

import {ReactNode} from "react"
import {ToastProvider} from "@/components/ui/ToastProvider"
import {TooltipProvider} from "@/components/ui/TooltipProvider"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ThemeProvider} from "@/components/ThemeProvider"
import { DevTool } from "./DevTool"
import {NuqsAdapter} from "nuqs/adapters/next"

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
            <NuqsAdapter>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </NuqsAdapter>
        </QueryClientProvider>
    )
}

export {Providers}