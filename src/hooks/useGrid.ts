import {useState, useEffect, useMemo} from "react"
import { Widget } from "@/database"

export const useGrid = (activeWidget: Widget | null, widgets: Widget[] | undefined) => {
    const filteredWidgets = useMemo(() => {
        if (!widgets) return []
        return widgets
    }, [widgets])

    const [gridCells, setGridCells] = useState<{
        x: number,
        y: number,
        width: number,
        height: number,
        isDroppable: boolean
    }[]>([])

    const getOccupiedCells = () => {
        const occupiedCells: Record<string, boolean> = {}

        filteredWidgets?.map((widget) => {
            if (activeWidget && widget.id === activeWidget.id) return
            const { width, height, positionX, positionY } = widget

            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    occupiedCells[`${positionX + i},${positionY + j}`] = true
                }
            }
        })

        return occupiedCells
    }

    const canPlaceWidget = (widget: { width: number; height: number }, x: number, y: number) => {
        const { width, height } = widget
        const occupiedCells = getOccupiedCells()

        if (x + width > 4 || y + height > 4) return false

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const cellKey = `${x + i},${y + j}`
                if (occupiedCells[cellKey]) return false
            }
        }
        return true
    }

    useEffect(() => {
        if (!activeWidget) {
            setGridCells([])
            return
        }

        const cells = []
        const { width, height } = activeWidget

        for (let y = 0; y <= 4 - height; y++) {
            for (let x = 0; x <= 4 - width; x++) {
                const isDroppable = canPlaceWidget(activeWidget, x, y)
                cells.push({ x, y, width, height, isDroppable })
            }
        }

        setGridCells(cells)
    }, [activeWidget, filteredWidgets])

    return gridCells
}
