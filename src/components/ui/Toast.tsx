"use client"

import {toast as sonnerToast} from "sonner"
import { MeetingToast } from "@/components/toasts/MeetingToast"
import {ReminderToast} from "@/components/toasts/ReminderToast"
import {SuccessToast} from "@/components/toasts/SuccessToast"
import {ErrorToast} from "@/components/toasts/ErrorToast"

export const toast = {
    ...sonnerToast,

    meeting(title: string, url?: string) {
        return sonnerToast.custom((t) => <MeetingToast t={t} title={title} url={url} />, {duration: 10000, dismissible: true})
    },
    reminder(title: string) {
        return sonnerToast.custom((t) => <ReminderToast t={t} title={title} />, {duration: 10000, dismissible: true})
    },
    success(title: string) {
        return sonnerToast.custom((t) => <SuccessToast title={title} />, {duration: 3000, dismissible: false})
    },
    error(title: string) {
        return sonnerToast.custom((t) => <ErrorToast title={title} />, {duration: 3000, dismissible: false})
    }
}
