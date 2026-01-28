"use client"

import { TooltipProvider } from "@/components/ui/TooltipProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { ReactNode, useEffect, useState } from "react"
import { Toaster } from "sonner"

const queryClient = new QueryClient()

function Providers({children}: {children: ReactNode}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    )
}

export { Providers }
