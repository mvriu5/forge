"use client"

import {Header} from "@/components/Header"
import { TooltipProvider } from "lunalabs-ui"
import React from "react"

export default function Dashboard() {
    return (
        <TooltipProvider>
            <div className={"flex flex-col w-full h-full"}>
                <Header />
            </div>
        </TooltipProvider>
    )
}