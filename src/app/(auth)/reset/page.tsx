"use client"

import {DotPattern} from "@/components/DotPattern"
import {cn} from "@/lib/utils"
import {ToastProvider} from "lunalabs-ui"
import {ResetPasswordCard} from "@/components/cards/ResetPasswordCard"

export default function ResetPasswordPage() {
    return (
        <ToastProvider>
            <div className={"h-screen w-full flex items-center justify-center"}>
                <DotPattern className={cn(
                    "[mask-image:radial-gradient(450px_circle_at_center,gray,transparent)]",
                )}/>
                <ResetPasswordCard />
            </div>
        </ToastProvider>
    )
}