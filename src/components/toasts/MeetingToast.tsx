"use client"

import * as React from "react"
import {toast} from "sonner"
import Link from "next/link"
import {Headset, X} from "lucide-react"

type MeetingToastProps = {
    t: string | number
    title: string
    url?: string
}

function MeetingToast({ t, title, url }: MeetingToastProps) {
    return (
        <div className="w-[380px] min-h-16 flex items-center rounded-md border border-main/40 bg-primary p-2 shadow-xl">
            <div className="w-full h-full flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Headset size={24} className="text-tertiary"/>
                    <div className={"flex flex-col"}>
                        <p className="text-sm font-medium">{title}</p>
                        {url &&
                            <Link
                                className="inline-flex items-center text-xs text-secondary hover:text-info underline"
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Join meeting
                            </Link>
                        }
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

export {MeetingToast}