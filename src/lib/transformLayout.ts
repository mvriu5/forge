import {Widget} from "@/database"
import {getWidgetPreview} from "@/lib/definitions"

export type Breakpoint = "desktop" | "tablet" | "mobile"

const sortWidgetsByPosition = (widgets: Widget[]): Widget[] => {
    return [...widgets].sort((a, b) => {
        if (a.positionY !== b.positionY) return a.positionY - b.positionY
        return a.positionX - b.positionX
    })
}

const placeWidgetsInGrid = (widgets: Widget[], breakpoint: Breakpoint, maxCols: number) => {
    const grid: (Widget | null)[][] = []
    const placedWidgets: Widget[] = []

    for (let i = 0; i < Math.ceil(widgets.length * 2); i++) {
        grid[i] = new Array(maxCols).fill(null)
    }

    widgets.map((widget) => {
        const widgetConfig = getWidgetPreview(widget.widgetType)
        if (!widgetConfig || !widgetConfig.sizes) return

        const responsiveSize = widgetConfig.sizes[breakpoint]

        const widgetWidth = responsiveSize.width
        const widgetHeight = responsiveSize.height

        let placed = false
        for (let row = 0; row < grid.length && !placed; row++) {
            for (let col = 0; col <= maxCols - widgetWidth && !placed; col++) {
                // Prüfe ob der Platz frei ist
                let canPlace = true
                for (let r = row; r < row + widgetHeight && canPlace; r++) {
                    for (let c = col; c < col + widgetWidth && canPlace; c++) {
                        if (r >= grid.length || grid[r][c] !== null) {
                            canPlace = false
                        }
                    }
                }

                if (canPlace) {
                    // Platziere das Widget
                    for (let r = row; r < row + widgetHeight; r++) {
                        for (let c = col; c < col + widgetWidth; c++) {
                            if (r >= grid.length) {
                                grid[r] = new Array(maxCols).fill(null)
                            }
                            grid[r][c] = widget
                        }
                    }

                    placedWidgets.push({
                        ...widget,
                        positionX: col,
                        positionY: row,
                        width: widgetWidth,
                        height: widgetHeight,
                    })
                    placed = true
                }
            }
        }

        if (!placed) {
            placedWidgets.push({
                ...widget,
                positionX: 0,
                positionY: placedWidgets.length,
                width: widgetWidth,
                height: widgetHeight,
            })
        }
    })

    return placedWidgets
}

export const transformLayout = (widgets: Widget[], breakpoint: Breakpoint): Widget[] => {
    const sortedWidgets = sortWidgetsByPosition(widgets)

    if (breakpoint === "mobile") {
        return sortedWidgets.map((widget, index) => {
            const widgetConfig = getWidgetPreview(widget.widgetType)
            if (!widgetConfig || !widgetConfig.sizes) return widget

            const responsiveSize = widgetConfig.sizes[breakpoint]

            return {
                ...widget,
                positionX: 0,
                positionY: index,
                width: responsiveSize.width,
                height: responsiveSize.height,
            }
        })
    }

    if (breakpoint === "tablet") {
        return placeWidgetsInGrid(sortedWidgets, breakpoint, 2)
    }

    return sortedWidgets.map((widget) => {
        const widgetConfig = getWidgetPreview(widget.widgetType)
        const responsiveSize = widgetConfig.sizes[breakpoint]

        return {
            ...widget,
            width: responsiveSize.width,
            height: responsiveSize.height,
        }
    })
}

export const getGridClasses = (breakpoint: Breakpoint): string => {
    switch (breakpoint) {
        case "mobile":
            return "grid grid-cols-1 auto-rows-max gap-4 p-4"
        case "tablet":
            return "grid grid-cols-2 auto-rows-[200px] gap-4 p-4"
        default:
            return "grid grid-cols-4 grid-rows-4 gap-4 p-4"
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