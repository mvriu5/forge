"use client"

import * as React from "react"
import {CircleX} from "lucide-react"

type ErrorToastProps = {
    title: string
}

function ErrorToast({ title }: ErrorToastProps) {
    return (
        <div className="w-95 min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className={"rounded-md p-1 bg-error/5 border border-error/20 shadow-xs dark:shadow-md"}>
                        <CircleX size={24} className="text-error"/>
                    </div>
                    <p className="text-sm font-medium">{title}</p>
                </div>
            </div>
        </div>
    )
}

export {ErrorToast}
