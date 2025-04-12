"use client"

import {createContext, useContext, useState, useCallback, useRef, memo, useMemo} from "react"
import type React from "react"
import type {ReactNode} from "react"
import {Tooltip, type TooltipProps} from "@/components/ui/Tooltip"

interface TooltipContextType {
    addTooltip: (props: TooltipProps) => void
    removeTooltip: () => void
    lastTooltipTimestamp: number | null
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

const useTooltip = () => {
    const context = useContext(TooltipContext)
    if (context === undefined) {
        throw new Error("useTooltip muss innerhalb eines TooltipProviders verwendet werden")
    }
    return context
}

const TooltipStateContext = createContext<{ tooltip: TooltipProps | null, lastTooltipTimestamp: number | null }>({ tooltip: null, lastTooltipTimestamp: null })

const useTooltipState = () => useContext(TooltipStateContext)

const TooltipContainer = memo(() => {
    const { tooltip, lastTooltipTimestamp } = useTooltipState()

    if (!tooltip) return null

    return (
        <TooltipRenderer
            tooltip={tooltip}
            lastTooltipTimestamp={lastTooltipTimestamp}
        />
    )
})
TooltipContainer.displayName = 'TooltipContainer'


const TooltipRenderer = memo(({ tooltip, lastTooltipTimestamp }: { tooltip: TooltipProps | null, lastTooltipTimestamp: number | null}) => {
    if (!tooltip) return null
    return <Tooltip lastTooltipTimestamp={lastTooltipTimestamp} {...tooltip} />
})

const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tooltip, setTooltip] = useState<TooltipProps | null>(null)
    const [lastTooltipTimestamp, setLastTooltipTimestamp] = useState<number | null>(null)

    const tooltipIdRef = useRef<number>(0)
    const tooltipStartRef = useRef<number | null>(null)
    const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const addTooltip = useCallback((props: Omit<TooltipProps, "x" | "y">) => {
        if (removeTimerRef.current) {
            clearTimeout(removeTimerRef.current)
            removeTimerRef.current = null
        }

        if (tooltip && tooltip.message === props.message) return

        tooltipStartRef.current = Date.now()
        tooltipIdRef.current += 1
        setTooltip({ ...props, id: tooltipIdRef.current })
    }, [tooltip])

    const removeTooltip = useCallback(() => {
        if (!tooltipStartRef.current) {
            setTooltip(null)
            return
        }

        const elapsed = Date.now() - tooltipStartRef.current
        const delay = elapsed >= 300 ? 0 : 300 - elapsed

        removeTimerRef.current = setTimeout(() => {
            setLastTooltipTimestamp(Date.now())
            setTooltip(null)
            tooltipStartRef.current = null
            removeTimerRef.current = null
        }, delay)
    }, [])

    const actionsContextValue = useMemo(() => {
        return { addTooltip, removeTooltip, lastTooltipTimestamp }
    }, [addTooltip, removeTooltip, lastTooltipTimestamp])

    const stateContextValue = useMemo(() => {
        return { tooltip, lastTooltipTimestamp }
    }, [tooltip, lastTooltipTimestamp])



    return (
        <TooltipContext.Provider value={actionsContextValue}>
            <TooltipStateContext.Provider value={stateContextValue}>
                {children}
                <TooltipContainer />
            </TooltipStateContext.Provider>
        </TooltipContext.Provider>
    )
}

function tooltip<T extends HTMLElement>(props: Omit<TooltipProps, "trigger">) {
    const { addTooltip, removeTooltip } = useTooltip()
    const targetRef = useRef<T | null>(null)

    const onMouseEnter = useCallback((e: React.MouseEvent<T>) => {
        targetRef.current = e.currentTarget
        addTooltip({
            ...props,
            trigger: e.currentTarget.getBoundingClientRect()
        })
    }, [addTooltip, props])

    const onMouseLeave = useCallback(() => {
        removeTooltip()
    }, [removeTooltip])

    return {
        onMouseEnter,
        onMouseLeave,
        ref: targetRef
    }
}

export {
    TooltipProvider,
    tooltip
}
