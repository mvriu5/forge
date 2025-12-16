"use client"

import * as React from "react"
import {toast} from "sonner"
import {BellRing, X} from "lucide-react"

type ReminderToastProps = {
    t: string | number
    title: string
}

function ReminderToast({ t, title }: ReminderToastProps) {
    return (
        <div className="w-[380px] min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BellRing size={24} className="text-tertiary"/>
                    <p className="text-sm font-medium">{title}</p>
                </div>
                <button
                    className="text-xs text-tertiary hover:text-primary"
                    onClick={() => toast.dismiss(t)}
                >
                    <X size={20}/>
                </button>
            </div>
        </div>
    )
}

export {ReminderToast}