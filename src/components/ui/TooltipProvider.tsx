"use client"

import { Tooltip, type TooltipProps } from "@/components/ui/Tooltip"
import type React from "react"
import type { ReactNode } from "react"
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react"

type TooltipCreate = Omit<TooltipProps, "rect" | "id">
type TooltipPayload = Omit<TooltipProps, "id">

type TooltipActions = {
    addTooltip: (props: TooltipPayload) => void
    removeTooltip: () => void
}

const TooltipContext = createContext<TooltipActions | undefined>(undefined)

export const useTooltipContext = () => {
    const ctx = useContext(TooltipContext)
    if (!ctx) throw new Error("useTooltipContext muss innerhalb eines TooltipProviders verwendet werden")
    return ctx
}

type TooltipLayerHandle = {
    show: (props: TooltipPayload) => void
    hide: () => void
}

const TooltipLayer = forwardRef<TooltipLayerHandle>(function TooltipLayer(_, ref) {
    const [tooltip, setTooltip] = useState<(TooltipProps & { id: number }) | null>(null)
    const [lastTooltipTimestamp, setLastTooltipTimestamp] = useState<number | null>(null)

    const tooltipIdRef = useRef(0)
    const tooltipStartRef = useRef<number | null>(null)
    const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tooltipRef = useRef<(TooltipProps & { id: number }) | null>(null)

    useEffect(() => {
        tooltipRef.current = tooltip
    }, [tooltip])

    const show = useCallback((props: TooltipPayload) => {
        if (removeTimerRef.current) {
            clearTimeout(removeTimerRef.current)
            removeTimerRef.current = null
        }

        if (tooltipRef.current?.message && tooltipRef.current.message === props.message) return

        tooltipStartRef.current = Date.now()
        tooltipIdRef.current += 1
        setTooltip({ ...props, id: tooltipIdRef.current })
    }, [])

    const hide = useCallback(() => {
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

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide])

    if (!tooltip) return null
    return <Tooltip lastTooltipTimestamp={lastTooltipTimestamp} {...tooltip} />
})

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const layerRef = useRef<TooltipLayerHandle | null>(null)

    // Provider hat KEINEN State -> rendert nicht bei Tooltip show/hide
    const addTooltip = useCallback((props: TooltipPayload) => {
        layerRef.current?.show(props)
    }, [])

    const removeTooltip = useCallback(() => {
        layerRef.current?.hide()
    }, [])

    const value = useMemo(() => ({ addTooltip, removeTooltip }), [addTooltip, removeTooltip])

    return (
        <TooltipContext.Provider value={value}>
            {children}
            <TooltipLayer ref={layerRef} />
        </TooltipContext.Provider>
    )
}

export function useTooltip<T extends HTMLElement>(props: TooltipCreate) {
    const { addTooltip, removeTooltip } = useTooltipContext()
    const targetRef = useRef<T | null>(null)

    const onMouseEnter = useCallback(
        (e: React.MouseEvent<T>) => {
            targetRef.current = e.currentTarget
            addTooltip({
                ...props,
                rect: e.currentTarget.getBoundingClientRect(),
            })
        },
        [addTooltip, props]
    )

    const onMouseLeave = useCallback(() => {
        removeTooltip()
    }, [removeTooltip])

    useEffect(() => () => removeTooltip(), [removeTooltip])

    return { onMouseEnter, onMouseLeave, ref: targetRef }
}
