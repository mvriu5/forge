"use client"

import {toast as sonnerToast} from "sonner"
import { MeetingToast } from "@/components/toasts/MeetingToast"

export const toast = {
    ...sonnerToast,

    meeting(title: string, url?: string) {
        return sonnerToast.custom((t) => <MeetingToast t={t} title={title} url={url} />, {duration: 1000000, dismissible: true})
    },
}
