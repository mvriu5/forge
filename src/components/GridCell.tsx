import {useDroppable} from "@dnd-kit/core"

interface GridCellProps {
    x: number
    y: number
    isDroppable?: boolean
}

const GridCell = ({ x, y, isDroppable }: GridCellProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: {x, y},
        disabled: !isDroppable
    })

    return (
        <div
            ref={setNodeRef}
            className={`h-[minmax(180px,180px)] rounded-md border ${
                isDroppable
                    ? isOver
                        ? "border-dashed border-main bg-primary/10"
                        : "border-dashed border-main/50"
                    : "border-transparent"
            }`}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
            }}
        />
    )
}

export {GridCell}
