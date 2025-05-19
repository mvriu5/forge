"use client"

import {type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react"
import {KeyboardShortcut} from "@/components/ui/KeyboardShortcut"
import {cn} from "@/lib/utils"
import {useHoverSupported} from "@/hooks/useHoverSupported"

interface TooltipProps {
    id?: number
    message?: string
    width?: number
    trigger: DOMRect
    icon?: ReactNode
    anchor?: "tl" | "tc" | "tr" | "bl" | "bc" | "br" | "lt" | "lc" | "lb" | "rt" | "rc" | "rb"
    delay?: number
    offset?: number
    shortcut?: string
    customTooltip?: ReactNode
}

const Tooltip = ({ id, anchor = "rc", width, delay = 1000, icon, message, offset = 8, shortcut, trigger, lastTooltipTimestamp, customTooltip }: TooltipProps & { lastTooltipTimestamp: number | null }) => {
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
                x = trigger.left + scrollX
                y = trigger.top + scrollY - offset - tooltipRect.height
                break
            case "tc":
                x = trigger.left + scrollX + (trigger.width / 2) - (tooltipRect.width / 2)
                y = trigger.top + scrollY - offset - tooltipRect.height
                break
            case "tr":
                x = trigger.right + scrollX - tooltipRect.width
                y = trigger.top + scrollY - offset - tooltipRect.height
                break

            // Bottom
            case "bl":
                x = trigger.left + scrollX
                y = trigger.bottom + scrollY + offset
                break
            case "bc":
                x = trigger.left + scrollX + (trigger.width / 2) - (tooltipRect.width / 2)
                y = trigger.bottom + scrollY + offset
                break
            case "br":
                x = trigger.right + scrollX - tooltipRect.width
                y = trigger.bottom + scrollY + offset
                break

            // Left
            case "lt":
                x = trigger.left + scrollX - offset - tooltipRect.width
                y = trigger.top + scrollY
                break
            case "lc":
                x = trigger.left + scrollX - offset - tooltipRect.width
                y = trigger.top + scrollY + (trigger.height / 2) - (tooltipRect.height / 2)
                break
            case "lb":
                x = trigger.left + scrollX - offset - tooltipRect.width
                y = trigger.bottom + scrollY - tooltipRect.height
                break

            // Right
            case "rt":
                x = trigger.right + scrollX + offset
                y = trigger.top + scrollY
                break
            case "rc":
                x = trigger.right + scrollX + offset
                y = trigger.top + scrollY + (trigger.height / 2) - (tooltipRect.height / 2)
                break
            case "rb":
                x = trigger.right + scrollX + offset
                y = trigger.bottom + scrollY - tooltipRect.height
                break

            default:
                x = trigger.left + scrollX
                y = trigger.top + scrollY
        }

        setPosition({ x, y })
    }, [anchor, offset, trigger.bottom, trigger.height, trigger.left, trigger.right, trigger.top, trigger.width])

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
            </div>
        )
    }

    return (
        <div
            className={cn("absolute z-50 w-max flex gap-4 items-center px-2 py-1 rounded-md shadow-md text-xs bg-[#0d0d0d] dark:bg-[#f2f2f2] border border-main/60")}
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
        </div>
    )
}

export {
    type TooltipProps,
    Tooltip
}
