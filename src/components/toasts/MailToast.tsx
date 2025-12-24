"use client"

import { Mails, X } from "lucide-react"
import { toast } from "sonner"

type MailToastProps = {
    t: string | number
    title: string
    snippet: string
}

function MailToast({ t, title, snippet }: MailToastProps) {
    return (
        <div className="w-95 min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className={"rounded-md p-1 bg-info/5 border border-info/20 shadow-xs dark:shadow-md"}>
                        <Mails height={24} width={24} className="text-info"/>
                    </div>
                    <div className={"flex flex-col"}>
                        <p className="text-sm font-medium">{title}</p>
                        <p className={"text-xs text-secondary"}>{snippet}</p>
                    </div>
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

export { MailToast }
