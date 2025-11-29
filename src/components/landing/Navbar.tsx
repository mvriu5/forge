"use client"

import React, {useState} from "react"
import {cn} from "@/lib/utils"
import Link from "next/link"
import {Github, Menu, X as Close} from "lucide-react"
import {Button} from "@/components/ui/Button"
import {X} from "@/components/svg/BookmarkIcons"
import {ForgeLogo} from "../svg/ForgeLogo"
import {useMediaQuery} from "@/hooks/media/useMediaQuery"
import {useOutsideClick} from "@/hooks/media/useOutsideClick"


function Navbar() {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [open, setOpen] = useState(false)
    const menuRef = useOutsideClick(() => setOpen(false))


    const menuItems = (
        <div className="flex flex-col items-start gap-2">
            <Link href="/" className={"text-lg text-secondary font-semibold hover:text-brand"}>Home</Link>
            <Link href={"/widgets"} className="text-lg text-secondary font-semibold hover:text-brand">Widgets</Link>
            <Link href={"/pricing"} className="text-lg text-secondary font-semibold hover:text-brand">Pricing</Link>
            <p className="text-lg text-tertiary/60 font-semibold cursor-default">Integrations</p>
            <p className="text-lg text-tertiary/60 font-semibold cursor-default">Docs</p>
            <Link href="/signin" className={"text-lg text-secondary font-semibold hover:text-brand mt-4"}>Login</Link>
            <Link href="/signup" className={"text-lg text-secondary font-semibold hover:text-brand"}>Sign up</Link>
        </div>
    )

    if (isDesktop) {
        return (
            <header className="fixed z-10 hidden md:flex h-full flex-col justify-between gap-6 px-8 pt-18 pb-8">
                <div className={"flex flex-col gap-6"}>
                    <div className={"flex gap-2 items-center text-primary"}>
                        <Link href={"/"} className={"cursor-default"}>
                            <ForgeLogo/>
                        </Link>
                        <p className={"font-semibold text-xl font-mono"}>forge</p>
                    </div>
                    {menuItems}
                </div>
                <div className="flex items-center gap-2">
                    <Link href="https://github.com/mvriu5/forge">
                        <Button className="bg-transparent hover:bg-transparent text-tertiary p-0 border-0">
                            <Github size={20}/>
                        </Button>
                    </Link>
                    <Link href="https://x.com/tryforgeio">
                        <Button className="group bg-transparent hover:bg-transparent text-tertiary p-0 border-0">
                            <X className="fill-tertiary group-hover:fill-primary"/>
                        </Button>
                    </Link>
                </div>
            </header>
        )
    }

    if (!isDesktop) {
        return (
            <header
                className="fixed z-20 top-0 left-0 right-0 flex flex-col gap-4 md:hidden px-4 py-3 bg-primary/80 backdrop-blur-xl shadow-[0px_0px_20px_rgba(0,0,0,0.7)]"
                ref={menuRef}
            >
               <div className={"w-full flex items-center justify-between"}>
                   <div className="flex items-center gap-2 text-primary">
                       <Link href={"/"} className={"cursor-default"}>
                           <ForgeLogo/>
                       </Link>
                       <span className="font-semibold text-xl font-mono">forge</span>
                   </div>
                   <Button variant={"ghost"} className={"px-1.5"} onClick={() => setOpen(!open)}>
                       {open ? <Close className={cn(open && "text-primary")}/> : <Menu/>}
                   </Button>
               </div>
               {open &&
                   <div className={"flex flex-col gap-8"}>
                       {menuItems}
                       <div className="flex items-center gap-2">
                           <Link href="https://github.com/mvriu5/forge">
                               <Button className="bg-transparent hover:bg-transparent text-tertiary p-0 border-0">
                                   <Github size={20}/>
                               </Button>
                           </Link>
                           <Link href="https://x.com/tryforgeio">
                               <Button className="group bg-transparent hover:bg-transparent text-tertiary p-0 border-0">
                                   <X className="fill-tertiary group-hover:fill-primary"/>
                               </Button>
                           </Link>
                       </div>
                   </div>
               }

            </header>
        )
    }
}


export { Navbar }