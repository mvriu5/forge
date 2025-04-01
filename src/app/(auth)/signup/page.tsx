"use client"

import {ToastProvider} from "lunalabs-ui"
import {SignUpCard} from "@/components/cards/SignUpCard"
import {cn} from "@/lib/utils"
import {DotPattern} from "@/components/DotPattern"

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