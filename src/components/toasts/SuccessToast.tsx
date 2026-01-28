"use client"

import { Check } from "lucide-react"

type SuccessToastProps = {
    title: string
}

function SuccessToast({ title }: SuccessToastProps) {
    return (
        <div className="w-95 min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className={"rounded-md p-1 bg-success/5 border border-success/20 shadow-xs dark:shadow-md"}>
                        <Check size={24} className="text-success"/>
                    </div>
                    <p className="text-sm font-medium">{title}</p>
                </div>
            </div>
        </div>
    )
}

export { SuccessToast }
