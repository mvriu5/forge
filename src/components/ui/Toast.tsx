"use client"

import {toast as sonnerToast} from "sonner"
import { MeetingToast } from "@/components/toasts/MeetingToast"
import {ReminderToast} from "@/components/toasts/ReminderToast"
import {SuccessToast} from "@/components/toasts/SuccessToast"
import {ErrorToast} from "@/components/toasts/ErrorToast"
import {GithubToast} from "@/components/toasts/GithubToast"
import { MailToast } from "../toasts/MailToast"

export const toast = {
    ...sonnerToast,

    meeting(title: string, url?: string) {
        return sonnerToast.custom((t) => <MeetingToast t={t} title={title} url={url} />, {duration: 10000, dismissible: true})
    },
    reminder(title: string) {
        return sonnerToast.custom((t) => <ReminderToast t={t} title={title} />, {duration: 10000, dismissible: true})
    },
    success(title: string) {
        return sonnerToast.custom(() => <SuccessToast title={title} />, {duration: 3000, dismissible: false})
    },
    error(title: string) {
        return sonnerToast.custom(() => <ErrorToast title={title} />, {duration: 3000, dismissible: false})
    },
    github(title: string, issues: number, pullRequests: number) {
        return sonnerToast.custom((t) => <GithubToast t={t} title={title} issues={issues} pullRequests={pullRequests} />, {duration: 10000, dismissible: true})
    },
    mail(title: string, snippet: string) {
        return sonnerToast.custom((t) => <MailToast t={t} title={title} snippet={snippet} />, {duration: 10000, dismissible: true})
    },
}
