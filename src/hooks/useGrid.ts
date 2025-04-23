import { useState, useEffect } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import { Widget } from "@/database"
import {useDashboardStore} from "@/store/dashboardStore"

export const useGrid = (activeWidget: Widget | null) => {
    const {currentDashboard} = useDashboardStore()

    const [gridCells, setGridCells] = useState<{ x: number, y: number, isDroppable: boolean }[]>([])

    const getOccupiedCells = () => {
        const occupiedCells: Record<string, boolean> = {}
        const widgets = useWidgetStore.getState().widgets?.filter((w) => w.dashboardId === currentDashboard?.id)

        widgets?.map((widget) => {
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
        if (!currentDashboard) return

        const cells = []
        const occupiedCells = getOccupiedCells()

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const isOccupied = occupiedCells[`${x},${y}`]
                let isDroppable = false

                if (activeWidget && !isOccupied) {
                    isDroppable = canPlaceWidget(activeWidget, x, y)
                }

                cells.push({ x, y, isDroppable })
            }
        }

        setGridCells(cells)
    }, [activeWidget])

    return gridCells
}
