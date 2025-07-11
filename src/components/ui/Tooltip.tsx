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

const Tooltip = ({ id, anchor = "rc", width, delay = 1000, icon, message, offset = 8, shortcut, rect, lastTooltipTimestamp, customTooltip, showArrow = true }: TooltipProps & { lastTooltipTimestamp: number | null }) => {
    const canHover = useHoverSupported()

    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const timeout = useRef<number | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const calculatePosition = useCallback(() => {
        if (!tooltipRef.current) return
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        const scrollX = window.scrollX || document.documentElement.scrollLeft
        const scrollY = window.scrollY || document.documentElement.scrollTop

        let x: number
        let y: number

        switch (anchor) {
            //Top
            case "tl":
                x = rect.left + scrollX
                y = rect.top + scrollY - offset - tooltipRect.height
                break
            case "tc":
                x = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2)
                y = rect.top + scrollY - offset - tooltipRect.height
                break
            case "tr":
                x = rect.right + scrollX - tooltipRect.width
                y = rect.top + scrollY - offset - tooltipRect.height
                break

            // Bottom
            case "bl":
                x = rect.left + scrollX
                y = rect.bottom + scrollY + offset
                break
            case "bc":
                x = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2)
                y = rect.bottom + scrollY + offset
                break
            case "br":
                x = rect.right + scrollX - tooltipRect.width
                y = rect.bottom + scrollY + offset
                break

            // Left
            case "lt":
                x = rect.left + scrollX - offset - tooltipRect.width
                y = rect.top + scrollY
                break
            case "lc":
                x = rect.left + scrollX - offset - tooltipRect.width
                y = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2)
                break
            case "lb":
                x = rect.left + scrollX - offset - tooltipRect.width
                y = rect.bottom + scrollY - tooltipRect.height
                break

            // Right
            case "rt":
                x = rect.right + scrollX + offset
                y = rect.top + scrollY
                break
            case "rc":
                x = rect.right + scrollX + offset
                y = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2)
                break
            case "rb":
                x = rect.right + scrollX + offset
                y = rect.bottom + scrollY - tooltipRect.height
                break

            default:
                x = rect.left + scrollX
                y = rect.top + scrollY
        }

        setPosition({ x, y })
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

    const arrowStyles = showArrow ? getArrowClasses(anchor) : 0

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
