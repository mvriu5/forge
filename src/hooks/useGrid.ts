import { Widget } from "@/database"
import { useMemo } from "react"

type GridCell = {
    x: number
    y: number
    width: number
    height: number
    isDroppable: boolean
}

const GRID_SIZE = 4

export const useGrid = (activeWidget: Widget | null, widgets: Widget[] | undefined) => {
    return useMemo<GridCell[]>(() => {
        if (!activeWidget) return []

        const occupiedCells = new Set<string>()
        const filteredWidgets = widgets ?? []

        for (const widget of filteredWidgets) {
            if (widget.id === activeWidget.id) continue

            for (let i = 0; i < widget.width; i++) {
                for (let j = 0; j < widget.height; j++) {
                    occupiedCells.add(`${widget.positionX + i},${widget.positionY + j}`)
                }
            }
        }

        const canPlaceWidget = (x: number, y: number) => {
            if (x + activeWidget.width > GRID_SIZE || y + activeWidget.height > GRID_SIZE) return false

            for (let i = 0; i < activeWidget.width; i++) {
                for (let j = 0; j < activeWidget.height; j++) {
                    if (occupiedCells.has(`${x + i},${y + j}`)) return false
                }
            }

            return true
        }

        const cells: GridCell[] = []

        for (let y = 0; y <= GRID_SIZE - activeWidget.height; y++) {
            for (let x = 0; x <= GRID_SIZE - activeWidget.width; x++) {
                cells.push({
                    x,
                    y,
                    width: activeWidget.width,
                    height: activeWidget.height,
                    isDroppable: canPlaceWidget(x, y),
                })
            }
        }

        return cells
    }, [activeWidget, widgets])
}
