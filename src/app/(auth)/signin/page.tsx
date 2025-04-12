"use client"

import {SignInCard} from "@/components/cards/SignInCard"
import {cn} from "@/lib/utils"
import {DotPattern} from "@/components/DotPattern"
import { ToastProvider } from "@/components/ui/ToastProvider"

export default function SignIn() {

    return (
        <ToastProvider>
            <div className={"h-screen w-full flex items-center justify-center"}>
                <DotPattern className={cn(
                    "[mask-image:radial-gradient(450px_circle_at_center,gray,transparent)]",
                )}/>
                <SignInCard/>
            </div>
        </ToastProvider>
    )
}