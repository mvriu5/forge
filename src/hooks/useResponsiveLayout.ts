"use client"

import { useMemo } from "react"
import { transformLayout, type Breakpoint, getGridClasses, getContainerHeight } from "@/lib/transformLayout"
import { Widget } from "@/database"
import { useBreakpoint } from "@/hooks/useBreakpoint"


const layoutCache = new Map<string, Widget[]>()

const getCacheKey = (widgets: Widget[], breakpoint: Breakpoint): string => {
    const widgetIds = widgets.map((w) => `${w.id}-${w.positionX}-${w.positionY}`).join(",")
    return `${breakpoint}-${widgetIds}`
}

export const useResponsiveLayout = (originalWidgets: Widget[]) => {
    const {breakpoint} = useBreakpoint()

    const transformedWidgets = useMemo(() => {
        if (!originalWidgets || originalWidgets.length === 0) return []

        const cacheKey = getCacheKey(originalWidgets, breakpoint)

        if (layoutCache.has(cacheKey)) {
            return layoutCache.get(cacheKey)!
        }

        const transformed = transformLayout(originalWidgets, breakpoint)
        layoutCache.set(cacheKey, transformed)

        if (layoutCache.size > 50) {
            const firstKey = layoutCache.keys().next().value ?? ""
            layoutCache.delete(firstKey)
        }

        return transformed
    }, [originalWidgets, breakpoint])

    const gridClasses = useMemo(() => getGridClasses(breakpoint), [breakpoint])
    const containerHeight = useMemo(() => getContainerHeight(breakpoint), [breakpoint])

    return {
        transformedWidgets,
        breakpoint,
        gridClasses,
        containerHeight,
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop",
    }
}
