import {useDroppable} from "@dnd-kit/core"
import React from "react"

interface GridCellProps {
    x: number
    y: number
    width: number
    height: number
    isDroppable: boolean
}

const GridCell = ({ x, y, width, height, isDroppable }: GridCellProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: {x, y},
        disabled: !isDroppable
    })

    return (
        <div
            ref={setNodeRef}
            className={`rounded-md border-2 ${
                isDroppable && isOver
                    ? "border-dashed border-main bg-tertiary"
                    : "border-transparent"
            }`}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
                gridColumnEnd: x + 1 + width,
                gridRowEnd: y + 1 + height,
                minHeight: `${height * 180}px`,
            }}
        />
    )
}

export {GridCell}