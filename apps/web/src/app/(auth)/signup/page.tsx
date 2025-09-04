"use client"

import {SignUpCard} from "@/components/cards/SignUpCard"
import {cn} from "@/lib/utils"
import {DotPattern} from "@forge/ui/components/svg/DotPattern"
import {ToastProvider} from "@/components/ui/ToastProvider"

export default function SignUp() {
    return (
        <ToastProvider>
            <div className={"h-screen w-full flex items-center justify-center"}>
                <DotPattern className={cn(
                    "[mask-image:radial-gradient(450px_circle_at_center,white,transparent)]",
                )}/>
                <SignUpCard/>
            </div>
        </ToastProvider>
    )
}