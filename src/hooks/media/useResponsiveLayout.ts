"use client"

import {useMemo, useRef} from "react"
import { transformLayout, type Breakpoint, getGridClasses, getContainerHeight } from "@/lib/transformLayout"
import { Widget } from "@/database"
import { useBreakpoint } from "@/hooks/media/useBreakpoint"

const layoutCache = new Map<string, Widget[]>()

const getCacheKey = (widgets: Widget[], breakpoint: Breakpoint): string => {
    const widgetIds = widgets
        .map((w) => `${w.id}-${w.positionX}-${w.positionY}-${w.width}-${w.height}-${w.updatedAt ?? ""}-${JSON.stringify(w.config ?? null)}`)
        .join(",")
    return `${breakpoint}-${widgetIds}`
}

const areWidgetsEqual = (a: Widget, b: Widget): boolean => {
    if (a === b) return true

    return (
        a.id === b.id
        && a.userId === b.userId
        && a.dashboardId === b.dashboardId
        && a.widgetType === b.widgetType
        && a.width === b.width
        && a.height === b.height
        && a.positionX === b.positionX
        && a.positionY === b.positionY
        && a.createdAt === b.createdAt
        && a.updatedAt === b.updatedAt
        && JSON.stringify(a.config ?? null) === JSON.stringify(b.config ?? null)
    )
}

export const useResponsiveLayout = (originalWidgets: Widget[]) => {
    const {breakpoint} = useBreakpoint()
    const previousTransformedRef = useRef<Map<string, Widget>>(new Map())
    const layoutKey = getCacheKey(originalWidgets, breakpoint)

    const transformedWidgets = useMemo(() => {
        if (!originalWidgets || originalWidgets.length === 0) return []
        if (layoutCache.has(layoutKey)) return layoutCache.get(layoutKey)!

        const transformed = transformLayout(originalWidgets, breakpoint)
        layoutCache.set(layoutKey, transformed)

        if (layoutCache.size > 50) {
            const firstKey = layoutCache.keys().next().value ?? ""
            layoutCache.delete(firstKey)
        }

        return transformed
    }, [layoutKey])

    const stableWidgets = useMemo(() => {
        if (!transformedWidgets || transformedWidgets.length === 0) {
            previousTransformedRef.current.clear()
            return []
        }

        const nextMap = new Map<string, Widget>()

        const widgetsWithStableRefs = transformedWidgets.map((widget) => {
            const previous = previousTransformedRef.current.get(widget.id)

            if (previous && areWidgetsEqual(previous, widget)) {
                nextMap.set(widget.id, previous)
                return previous
            }

            nextMap.set(widget.id, widget)
            return widget
        })

        previousTransformedRef.current = nextMap

        return widgetsWithStableRefs
    }, [transformedWidgets])

    const gridClasses = useMemo(() => getGridClasses(breakpoint), [breakpoint])
    const containerHeight = useMemo(() => getContainerHeight(breakpoint), [breakpoint])

    return {
        transformedWidgets: stableWidgets,
        breakpoint,
        gridClasses,
        containerHeight,
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop",
    }
}
