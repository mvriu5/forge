"use client"

import type React from "react"
import {cn} from "@/lib/utils"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link"
import {Github} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {X} from "@/components/svg/BookmarkIcons"


function Navbar() {
    return (
        <div className={"fixed h-full flex flex-col justify-between gap-6 px-8 pt-16 pb-8"}>
            <div className={"flex flex-col gap-6"}>
                <div className={cn("flex gap-2 items-center text-primary")}>
                    <ForgeLogo/>
                    <p className={cn("font-semibold text-xl font-mono")}>forge</p>
                </div>

                <div className={"flex flex-col gap-1"}>
                    <Link href={"/"}>
                        <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Home</p>
                    </Link>
                    <p className={"text-lg text-tertiary/60 font-semibold cursor-default"}>Widgets</p>
                    <p className={"text-lg text-tertiary/60 font-semibold cursor-default"}>Pricing</p>
                    <p className={"text-lg text-tertiary/60 font-semibold cursor-default"}>Integrations</p>
                    <p className={"text-lg text-tertiary/60 font-semibold cursor-default"}>Docs</p>
                </div>
                <div className={"flex flex-col gap-1"}>
                    <Link href={"/signin"}>
                        <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Login</p>
                    </Link>
                    <Link href={"/signup"}>
                        <p className={"text-lg text-secondary font-semibold hover:text-brand"}>Sign up</p>
                    </Link>
                </div>
            </div>

            <div className={"flex items-center gap-2"}>
                <Link href={"https://github.com/mvriu5/forge"}>
                    <Button className={"bg-transparent hover:bg-transparent text-tertiary p-0 border-0"}>
                        <Github size={20}/>
                    </Button>
                </Link>

                <Link href={"https://x.com/tryforgeio"}>
                    <Button className={"group bg-transparent hover:bg-transparent text-tertiary p-0 border-0"}>
                        <X className={"fill-tertiary group-hover:fill-primary"}/>
                    </Button>
                </Link>
            </div>
        </div>
    )
}


export { Navbar }