"use client"

import type React from "react"
import {cn} from "@/lib/utils"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link"


function Navbar() {
    return (
        <div className={"fixed h-full flex flex-col gap-6 px-8 py-16"}>
            <div className={cn("flex gap-2 items-center text-primary")}>
                <ForgeLogo/>
                <p className={cn("font-semibold text-xl font-mono")}>forge</p>
            </div>

            <div className={"flex flex-col gap-1"}>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Home</p>
                </Link>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Widgets</p>
                </Link>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Pricing</p>
                </Link>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Docs</p>
                </Link>
            </div>
            <div className={"flex flex-col gap-1"}>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Login</p>
                </Link>
                <Link href={""}>
                    <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Sign up</p>
                </Link>
            </div>
        </div>
    )
}


export { Navbar }