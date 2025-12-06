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
                    <Toaster
                        theme="dark"
                        toastOptions={{
                            classNames: {
                                toast: "!border-main/40 !bg-primary !text-primary"
                            }
                        }}
                        icons={{
                            success: <Check size={24} className={"text-brand"}/>,
                            info: <Info size={24} className={"text-brand"}/>,
                            warning: <TriangleAlert size={24} className={"text-brand"}/>,
                            error: <CircleX size={24} className={"text-brand"}/>,
                            loading: <LoaderCircle size={24} className={"text-brand animate-spin"}/>,
                        }}
                    />
                    {children}
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export {Providers}