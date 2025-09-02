import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function hexToRgba(hex: string, alpha: number) {
    const [r, g, b] = hex
        .replace(/^#/, "")
        .match(/.{2}/g)!
        .map((h) => Number.parseInt(h, 16))

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
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