"use client"

import { useState, useEffect, useMemo } from "react"
import {transformLayout, type Breakpoint, getGridClasses, getContainerHeight} from "@/lib/transformLayout"
import {Widget} from "@/database"


const useBreakpoint = (): Breakpoint => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth
            if (width < 768) {
                setBreakpoint("mobile")
            } else if (width < 1280) {
                setBreakpoint("tablet")
            } else {
                setBreakpoint("desktop")
            }
        }

        updateBreakpoint()

        window.addEventListener("resize", updateBreakpoint)
        return () => window.removeEventListener("resize", updateBreakpoint)
    }, [])

    return breakpoint
}

const layoutCache = new Map<string, Widget[]>()

const getCacheKey = (widgets: Widget[], breakpoint: Breakpoint): string => {
    const widgetIds = widgets.map((w) => `${w.id}-${w.positionX}-${w.positionY}`).join(",")
    return `${breakpoint}-${widgetIds}`
}

// Main Responsive Layout Hook
export const useResponsiveLayout = (originalWidgets: Widget[]) => {
    const breakpoint = useBreakpoint()

    // Transformierte Widgets mit Caching
    const transformedWidgets = useMemo(() => {
        if (!originalWidgets || originalWidgets.length === 0) return []

        const cacheKey = getCacheKey(originalWidgets, breakpoint)

        if (layoutCache.has(cacheKey)) {
            return layoutCache.get(cacheKey)!
        }

        const transformed = transformLayout(originalWidgets, breakpoint)
        layoutCache.set(cacheKey, transformed)

        // Cache-Größe begrenzen (LRU-ähnlich)
        if (layoutCache.size > 50) {
            const firstKey = layoutCache.keys().next().value ?? ""
            layoutCache.delete(firstKey)
        }

        return transformed
    }, [originalWidgets, breakpoint])

    const gridClasses = useMemo(() => getGridClasses(breakpoint), [breakpoint])
    const containerHeight = useMemo(() => getContainerHeight(breakpoint), [breakpoint])

    const canEdit = breakpoint === "desktop"

    return {
        transformedWidgets,
        breakpoint,
        gridClasses,
        containerHeight,
        canEdit,
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop",
    }
}
