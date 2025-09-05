import clsx, { ClassValue } from 'clsx'
import {twMerge} from "tailwind-merge"

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

export function getUpdateTimeLabel(date: Date): string {
    const now = new Date()
    const diffSec = (now.getTime() - date.getTime()) / 1000

    if (diffSec < 120) {
        return 'Updated now'
    }

    const minutes = Math.floor(diffSec / 60)
    if (diffSec < 60 * 60) {
        return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    }

    const hours = Math.floor(diffSec / 3600)
    if (diffSec < 60 * 60 * 24) {
        return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`
    }

    const days = Math.floor(diffSec / (3600 * 24))
    if (diffSec < 3600 * 24 * 7) {
        return `Updated ${days} day${days !== 1 ? 's' : ''} ago`
    }

    const weeks = Math.floor(diffSec / (3600 * 24 * 7))
    if (diffSec < 3600 * 24 * 30) {
        return `Updated ${weeks} week${weeks !== 1 ? 's' : ''} ago`
    }

    const months = Math.floor(diffSec / (3600 * 24 * 30))
    if (diffSec < 3600 * 24 * 30 * 12) {
        return `Updated ${months} month${months !== 1 ? 's' : ''} ago`
    }

    return 'Updated last year'
}

export function hexToRgba(hex: string, alpha: number) {
    const [r, g, b] = hex
        .replace(/^#/, "")
        .match(/.{2}/g)!
        .map((h) => Number.parseInt(h, 16))

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}