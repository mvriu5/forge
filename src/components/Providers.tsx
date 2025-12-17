"use client"

import {ReactNode} from "react"
import {TooltipProvider} from "@/components/ui/TooltipProvider"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ThemeProvider} from "@/components/ThemeProvider"
import {Toaster} from "sonner"
import {Check, CircleX, Info, LoaderCircle, TriangleAlert} from "lucide-react"

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
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                disableTransitionOnChange
            >
                <TooltipProvider>
                    <Toaster theme="dark"/>
                    {children}
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export {Providers}