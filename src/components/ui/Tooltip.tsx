"use client"

import {type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react"
import {KeyboardShortcut} from "@/components/ui/KeyboardShortcut"
import {cn} from "@/lib/utils"
import {useHoverSupported} from "@/hooks/useHoverSupported"

interface TooltipProps {
    id?: number
    message?: string
    width?: number
    rect: DOMRect
    icon?: ReactNode
    anchor?: "tl" | "tc" | "tr" | "bl" | "bc" | "br" | "lt" | "lc" | "lb" | "rt" | "rc" | "rb"
    delay?: number
    offset?: number
    shortcut?: string
    customTooltip?: ReactNode
    showArrow?: boolean
}

const getArrowClasses = (anchor: string) => {
    switch (anchor) {
        // Top anchors - arrow points up
        case "tl":
        case "tc":
        case "tr":
            return {
                arrow: "absolute w-3 h-3 bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60 rotate-45 rounded-br-xs border-t-0 border-l-0",
                position: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2"
            }

        // Bottom anchors - arrow points down
        case "bl":
        case "bc":
        case "br":
            return {
                arrow: "absolute w-2.5 h-2.5 bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60 rounded-tl-xs rotate-45 border-b-0 border-r-0",
                position: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2"
            }

        // Left anchors - arrow points left
        case "lt":
        case "lc":
        case "lb":
            return {
                arrow: "absolute w-2 h-2 bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60 rotate-45 rounded-tr-xs border-b-0 border-l-0",
                position: "left-full top-1/2 -translate-y-1/2 -translate-x-1/2"
            }

        // Right anchors - arrow points right
        default:
            return {
                arrow: "absolute w-2 h-2 bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60 rotate-45 rounded-bl-xs border-t-0 border-r-0",
                position: "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
            }
    }
}

const flipAnchor = (anchor: string, tooltipRect: DOMRect, targetRect: DOMRect): string => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const computePos = (a: string) => {
        let x = 0
        let y = 0
        switch (a) {
            case "tl": x = targetRect.left; y = targetRect.top - tooltipRect.height; break
            case "tc": x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2; y = targetRect.top - tooltipRect.height; break
            case "tr": x = targetRect.right - tooltipRect.width; y = targetRect.top - tooltipRect.height; break
            case "bl": x = targetRect.left; y = targetRect.bottom; break
            case "bc": x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2; y = targetRect.bottom; break
            case "br": x = targetRect.right - tooltipRect.width; y = targetRect.bottom; break
            case "lt": x = targetRect.left - tooltipRect.width; y = targetRect.top; break
            case "lc": x = targetRect.left - tooltipRect.width; y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2; break
            case "lb": x = targetRect.left - tooltipRect.width; y = targetRect.bottom - tooltipRect.height; break
            case "rt": x = targetRect.right; y = targetRect.top; break
            case "rc": x = targetRect.right; y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2; break
            case "rb": x = targetRect.right; y = targetRect.bottom - tooltipRect.height; break
        }
        return { x, y }
    }

    const wouldOverflow = (pos: { x: number, y: number }) =>
        pos.x < 0 ||
        pos.x + tooltipRect.width > viewportWidth ||
        pos.y < 0 ||
        pos.y + tooltipRect.height > viewportHeight

    // 1️⃣ Check original position
    let pos = computePos(anchor)
    if (!wouldOverflow(pos)) return anchor

    // 2️⃣ Try prioritized alternatives
    const alternatives: Record<string, string[]> = {
        tl: ["tr", "lt", "bl", "rt"],
        tc: ["lc", "rc", "bc"],
        tr: ["tl", "rt", "br", "lt"],
        bl: ["br", "lb", "tl", "rb"],
        bc: ["lc", "rc", "tc"],
        br: ["bl", "rb", "tr", "lb"],
        lt: ["rt", "lc", "rc"],
        lc: ["tc", "bc", "rc"],
        lb: ["rb", "lc", "rc"],
        rt: ["lt", "rc", "lc"],
        rc: ["tc", "bc", "lc"],
        rb: ["lb", "rc", "lc"]
    }

    for (const alt of alternatives[anchor] || []) {
        pos = computePos(alt)
        if (!wouldOverflow(pos)) return alt
    }

    // 3️⃣ Fallback: clamp original
    return anchor
}

const Tooltip = ({ id, anchor = "rc", width, delay = 1000, icon, message, offset = 8, shortcut, rect, lastTooltipTimestamp, customTooltip, showArrow = true }: TooltipProps & { lastTooltipTimestamp: number | null }) => {
    const canHover = useHoverSupported()
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [adjustedAnchor, setAdjustedAnchor] = useState<string>(anchor)
    const timeout = useRef<number | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const calculatePosition = useCallback(() => {
        if (!tooltipRef.current) return
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        const smartAnchor = flipAnchor(anchor, tooltipRect, rect)
        setAdjustedAnchor(smartAnchor)

        const computePos = (a: string) => {
            let x = 0
            let y = 0
            switch (a) {
                case "tl": x = rect.left; y = rect.top - offset - tooltipRect.height; break
                case "tc": x = rect.left + rect.width / 2 - tooltipRect.width / 2; y = rect.top - offset - tooltipRect.height; break
                case "tr": x = rect.right - tooltipRect.width; y = rect.top - offset - tooltipRect.height; break
                case "bl": x = rect.left; y = rect.bottom + offset; break
                case "bc": x = rect.left + rect.width / 2 - tooltipRect.width / 2; y = rect.bottom + offset; break
                case "br": x = rect.right - tooltipRect.width; y = rect.bottom + offset; break
                case "lt": x = rect.left - offset - tooltipRect.width; y = rect.top; break
                case "lc": x = rect.left - offset - tooltipRect.width; y = rect.top + rect.height / 2 - tooltipRect.height / 2; break
                case "lb": x = rect.left - offset - tooltipRect.width; y = rect.bottom - tooltipRect.height; break
                case "rt": x = rect.right + offset; y = rect.top; break
                case "rc": x = rect.right + offset; y = rect.top + rect.height / 2 - tooltipRect.height / 2; break
                case "rb": x = rect.right + offset; y = rect.bottom - tooltipRect.height; break
            }
            return { x, y }
        }

        const pos = computePos(smartAnchor)

        const maxX = window.innerWidth - tooltipRect.width
        const maxY = window.innerHeight - tooltipRect.height
        const clampedX = Math.max(0, Math.min(pos.x, maxX))
        const clampedY = Math.max(0, Math.min(pos.y, maxY))

        setPosition({ x: clampedX, y: clampedY })
    }, [anchor, offset, rect.bottom, rect.height, rect.left, rect.right, rect.top, rect.width])

    useLayoutEffect(() => {
        if (isVisible) {
            calculatePosition()
        }
    }, [isVisible, calculatePosition])


    useEffect(() => {
        const currentTimestamp = Date.now()
        const lastTooltipVisible = lastTooltipTimestamp !== null && currentTimestamp - lastTooltipTimestamp < 500

        if (delay) {
            if (lastTooltipVisible) {
                calculatePosition()
                setIsVisible(true)
            } else {
                timeout.current = window.setTimeout(() => {
                    calculatePosition()
                    setIsVisible(true)
                }, delay)
            }
        } else if (timeout.current) {
            clearTimeout(timeout.current)
        }

        return () => {
            if (timeout.current) clearTimeout(timeout.current)
            window.removeEventListener('resize', calculatePosition)
            window.removeEventListener('scroll', calculatePosition)
        }
    }, [calculatePosition, delay, lastTooltipTimestamp])

    if (!canHover) return
    if (!isVisible) return
    if (!message && !customTooltip) return

    const arrowStyles = showArrow ? getArrowClasses(adjustedAnchor) : 0

    if (customTooltip) {
        return (
            <div
                className={cn("absolute z-50 shadow-md")}
                style={{
                    top: position.y,
                    left: position.x,
                    width: width ?? "auto"
                }}
                ref={tooltipRef}
                id={`tooltip-${id}`}
            >
                {customTooltip}
                {arrowStyles && <div className={cn(arrowStyles.arrow, arrowStyles.position)} />}
            </div>
        )
    }

    return (
        <div
            className={cn("absolute z-50 w-max flex gap-4 items-center px-2 py-1 rounded-md shadow-md text-xs bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60 overflow-visible")}
            style={{
                top: position.y,
                left: position.x,
                width: width ?? "auto"
            }}
            ref={tooltipRef}
            id={`tooltip-${id}`}
        >
            <div className={"flex gap-2 items-center text-xs text-white/80 dark:text-black/80"}>
                {icon}
                <span>{message}</span>
            </div>
            {shortcut &&
                <KeyboardShortcut
                    key={shortcut}
                    keyString={shortcut}
                    className={"bg-inverted dark:text-black/50"}/>
            }
            {arrowStyles && <div className={cn(arrowStyles.arrow, arrowStyles.position)} />}
        </div>
    )
}

export {
    type TooltipProps,
    Tooltip
}
