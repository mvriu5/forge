import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes))

export const CONTAINER_STYLES = {
    animation: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:duration-50 data-[state=closed]:duration-150",
        "data-[state=closed]:ease-in data-[state=open]:ease-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
        "origin-[--radix-context-menu-content-transform-origin] origin-[--radix-popover-content-transform-origin]",
        "origin-[--radix-dropdown-menu-content-transform-origin] origin-[--radix-select-content-transform-origin]"
    )
}

export function convertToRGBA(color: string, opacity: number): string {
    if (color.startsWith('rgba')) {
        return color
    }

    if (color.startsWith('#')) {
        const r = Number.parseInt(color.slice(1, 3), 16)
        const g = Number.parseInt(color.slice(3, 5), 16)
        const b = Number.parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    return `${color.split(')')[0]})`.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
}

export function getUpdateTimeLabel(date: Date | string | number | undefined | null): string {
    if (date == null) return 'Updated now'

    const d = date instanceof Date ? date : new Date(date as string | number)
    if (Number.isNaN(d.getTime())) return 'Updated now'

    const now = new Date()
    const diffSec = (now.getTime() - d.getTime()) / 1000

    if (diffSec < 120) return 'Updated now'

    const minutes = Math.floor(diffSec / 60)
    if (diffSec < 60 * 60) return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`

    const hours = Math.floor(diffSec / 3600)
    if (diffSec < 60 * 60 * 24) return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`

    const days = Math.floor(diffSec / (3600 * 24))
    if (diffSec < 3600 * 24 * 7) return `Updated ${days} day${days !== 1 ? 's' : ''} ago`

    const weeks = Math.floor(diffSec / (3600 * 24 * 7))
    if (diffSec < 3600 * 24 * 30) return `Updated ${weeks} week${weeks !== 1 ? 's' : ''} ago`

    const months = Math.floor(diffSec / (3600 * 24 * 30))
    if (diffSec < 3600 * 24 * 30 * 12) return `Updated ${months} month${months !== 1 ? 's' : ''} ago`

    return 'Updated last year'
}

export function getTimeLabel(date: Date | string | number | undefined | null): string {
    if (date == null) return 'Now'


    const d = date instanceof Date ? date : new Date(date as string | number)
    if (Number.isNaN(d.getTime())) return 'Now'

    const now = new Date()
    const diffSec = (now.getTime() - d.getTime()) / 1000

    if (diffSec < 120) return 'Now'

    const minutes = Math.floor(diffSec / 60)
    if (diffSec < 60 * 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`

    const hours = Math.floor(diffSec / 3600)
    if (diffSec < 60 * 60 * 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`

    const days = Math.floor(diffSec / (3600 * 24))
    if (diffSec < 3600 * 24 * 7) return `${days} day${days !== 1 ? 's' : ''} ago`

    const weeks = Math.floor(diffSec / (3600 * 24 * 7))
    if (diffSec < 3600 * 24 * 30) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`

    const months = Math.floor(diffSec / (3600 * 24 * 30))
    if (diffSec < 3600 * 24 * 30 * 12) return ` ${months} month${months !== 1 ? 's' : ''} ago`

    return 'Last year'
}

export function formatDate(date?: string | number | Date | null, hourFormat: "12" | "24" = "24"): string {
    if (!date) return ""

    const d = date instanceof Date ? date : new Date(date)
    if (Number.isNaN(d.getTime())) return ""

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: hourFormat === "12",
    }).format(d)
}

export function formatDateHeader(iso?: string | number | Date | null) {
    if (!iso) return ""
    const d = iso instanceof Date ? iso : new Date(iso)
    if (Number.isNaN(d.getTime())) return ""

    return new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long" }).format(d)
}

export function formatTime(iso?: string | number | Date | null, hourFormat: string = "24") {
    if (!iso) return ""
    const d = iso instanceof Date ? iso : new Date(iso)
    if (Number.isNaN(d.getTime())) return ""

    const hour12 = hourFormat === "12"
    const hourOption: '2-digit' | 'numeric' = hour12 ? 'numeric' : '2-digit'

    return new Intl.DateTimeFormat("en-US", { hour: hourOption, minute: "2-digit", hour12 }).format(d)
}

export function isSameDay (a?: string | number | Date | null, b?: string | number | Date | null) {
    if (!a || !b) return false
    const da = a instanceof Date ? a : new Date(a)
    const db = b instanceof Date ? b : new Date(b)
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

export function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export function formatPrettyDate(date: Date | null, options?: Intl.DateTimeFormatOptions) {
    if (!date) return ""
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("en-US", options ?? { year: "numeric", month: "short", day: "numeric" }).format(date)
}

export function differenceInCalendarDays(a: Date, b: Date) {
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    return Math.floor((startOfDay(a) - startOfDay(b)) / (24 * 60 * 60 * 1000))
}

export function formatWeatherHour(iso?: string | number | Date | null, hourFormat: string = "24") {
    if (!iso) return ""
    const d = iso instanceof Date ? iso : new Date(iso)
    if (Number.isNaN(d.getTime())) return ""

    if (hourFormat === "24") {
        const hour = d.getHours().toString().padStart(2, "0")
        return `${hour}:00`
    }

    const hour = d.getHours() % 12 || 12
    const ampm = d.getHours() >= 12 ? "PM" : "AM"
    return `${hour} ${ampm}`
}
