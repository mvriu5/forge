import {cn} from "@forge/ui/lib/utils"

interface DotPatternProps {
    width?: number
    height?: number
    className?: string
}

const DotPattern = ({width = 16, height = 16, className}: DotPatternProps) => {
    return (
        <svg
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        >
            <defs>
                <pattern
                    id="dotPattern"
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx={width / 2} cy={height / 2} r={1} fill="currentColor" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" opacity={0.3} />
        </svg>
    )
}

export {DotPattern}