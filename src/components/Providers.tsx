"use client"

import {ReactNode} from "react"
import {ToastProvider, TooltipProvider} from "lunalabs-ui"

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