"use client"

import {DotPattern} from "@/components/svg/DotPattern"
import {cn} from "@/lib/utils"
import {ToastProvider} from "@/components/ui/ToastProvider"
import {ForgotPasswordCard} from "@/components/cards/ForgotPasswordCard"

export default function ForgotPasswordPage() {
    return (
        <ToastProvider>
            <div className={"h-screen w-full flex items-center justify-center"}>
                <DotPattern className={cn(
                    "[mask-image:radial-gradient(450px_circle_at_center,gray,transparent)]",
                )}/>
                <ForgotPasswordCard />
            </div>
        </ToastProvider>
    )
}