"use client"

import * as React from "react"
import {Check} from "lucide-react"

type SuccessToastProps = {
    title: string
}

function SuccessToast({ title }: SuccessToastProps) {
    return (
        <div className="w-[380px] min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Check size={24} className="text-tertiary"/>
                    <p className="text-sm font-medium">{title}</p>
                </div>
            </div>
        </div>
    )
}

export {SuccessToast}