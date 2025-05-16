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

export function hexToRgba(hex: string, alpha: number) {
    const [r, g, b] = hex
        .replace(/^#/, "")
        .match(/.{2}/g)!
        .map((h) => Number.parseInt(h, 16))

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}