import {Widget} from "@/database"
import {getWidgetPreview} from "@/lib/widgetRegistry"

export type Breakpoint = "desktop" | "tablet" | "mobile"

const sortWidgetsByPosition = (widgets: Widget[]): Widget[] => {
    return [...widgets].sort((a, b) => {
        if (a.positionY !== b.positionY) return a.positionY - b.positionY
        return a.positionX - b.positionX
    })
}

export const transformLayout = (widgets: Widget[], breakpoint: Breakpoint): Widget[] => {
    if (!widgets || widgets.length === 0) return []

    const sortedWidgets = sortWidgetsByPosition(widgets)

    return sortedWidgets.map((widget, index) => {
        const widgetConfig = getWidgetPreview(widget.widgetType)

        if (!widgetConfig || !widgetConfig.preview.sizes) return widget

        const responsiveSize = widgetConfig.preview.sizes[breakpoint]

        if (!responsiveSize) return widget

        if (breakpoint === "mobile") {
            return {
                ...widget,
                positionX: 0,
                positionY: index,
                width: responsiveSize.width,
                height: responsiveSize.height,
            }
        }

        if (breakpoint === "tablet") {
            return {
                ...widget,
                positionX: index % 2,
                positionY: Math.floor(index / 2),
                width: responsiveSize.width,
                height: responsiveSize.height,
            }
        }

        return {
            ...widget,
            width: responsiveSize.width,
            height: responsiveSize.height,
        }
    })
}

// Hilfsfunktionen für CSS-Klassen
export const getGridClasses = (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
        case "mobile":
            return "grid-cols-1 gap-2 p-2"
        case "tablet":
            return "grid-cols-2 gap-4 p-4"
        default:
            return "grid-cols-4 grid-rows-4 gap-4 p-4"
    }
}

export const getContainerHeight = (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
        case "mobile":
        case "tablet":
            return "min-h-screen"
        default:
            return "h-[calc(100vh-48px)]"
    }
}