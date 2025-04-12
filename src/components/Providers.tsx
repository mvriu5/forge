"use client"

import {ReactNode} from "react"
import {ToastProvider} from "@/components/ui/ToastProvider"
import {TooltipProvider} from "@/components/ui/TooltipProvider"

function Providers({children}: {children: ReactNode}) {
    return (
        <TooltipProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </TooltipProvider>
    )
}

export {Providers}