"use client"

import type * as React from "react"
import * as RechartsPrimitive from "recharts"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { createContext, useContext, useId, useMemo, useEffect, useState, useRef } from "react"

const THEMES = { light: "", dark: ".dark" } as const

type ChartConfig = {
    [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
} & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = {
    config: ChartConfig
    chartRect?: DOMRect
}

const ChartTooltip = RechartsPrimitive.Tooltip
const ChartLegend = RechartsPrimitive.Legend

const ChartContext = createContext<ChartContextProps | null>(null)

function useChart() {
    const context = useContext(ChartContext)
    if (!context) throw new Error("useChart must be used within a <ChartContainer />")
    return context
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

interface ChartStyleProps {
    id: string
    config: ChartConfig
}

interface ChartTooltipContentProps extends React.ComponentProps<typeof RechartsPrimitive.Tooltip> {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    className?: string
    color?: string
    coordinate?: { x: number; y: number }
}

interface ChartLegendContentProps
    extends React.ComponentProps<"div">,
        Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> {
    hideIcon?: boolean
    nameKey?: string
}

const ChartContainer = ({ id, className, children, config, ...props }: ChartContainerProps) => {
    const uniqueId = useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
    const chartRef = useRef<HTMLDivElement>(null)
    const [chartRect, setChartRect] = useState<DOMRect | undefined>(undefined)

    useEffect(() => {
        if (chartRef.current) {
            setChartRect(chartRef.current.getBoundingClientRect())
        }
        const handleResize = () => {
            if (chartRef.current) {
                setChartRect(chartRef.current.getBoundingClientRect())
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <ChartContext.Provider value={{ config, chartRect }}>
            <div
                ref={chartRef}
                data-chart={chartId}
                className={cn(
                    "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:text-secondary " +
                    "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-white/10 " +
                    "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border " +
                    "[&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none " +
                    "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-white/10 " +
                    "[&_.recharts-radial-bar-background-sector]:fill-muted " +
                    "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-white/10 " +
                    "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border " +
                    "[&_.recharts-sector[stroke='#fff']]:stroke-transparent " +
                    "[&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
                    className,
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

const ChartStyle = ({ id, config }: ChartStyleProps) => {
    const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color)

    if (!colorConfig.length) return null

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) =>
                            `${prefix} [data-chart=${id}] {${colorConfig
                                .map(([key, itemConfig]) => {
                                    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
                                    return color ? `  --color-${key}: ${color};` : null
                                })
                                .join("\n")}}`,
                    )
                    .join("\n"),
            }}
        />
    )
}

const ChartTooltipContent = ({
                                 color,
                                 className,
                                 active,
                                 payload,
                                 indicator = "dot",
                                 hideLabel = false,
                                 hideIndicator = false,
                                 label,
                                 labelFormatter,
                                 labelClassName,
                                 formatter,
                                 nameKey,
                                 labelKey,
                                 coordinate,
                             }: ChartTooltipContentProps) => {
    const { config, chartRect } = useChart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const tooltipLabel = useMemo(() => {
        if (hideLabel || !payload?.length) return null

        const [item] = payload
        const key = `${labelKey || item.dataKey || item.name || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        const value =
            !labelKey && typeof label === "string" ? config[label as keyof typeof config]?.label || label : itemConfig?.label

        if (labelFormatter) {
            return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
        }

        if (!value) return null

        return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [label, payload, hideLabel, config, labelFormatter, labelClassName, labelKey])

    if (!active || !payload?.length || !mounted || !coordinate || !chartRect) return null

    const screenX = chartRect.left + coordinate.x
    const screenY = chartRect.top + coordinate.y

    const nestLabel = payload.length === 1 && indicator !== "dot"

    const tooltipContent = (
        <div
            className={cn(
                "grid min-w-[8rem] items-start gap-1.5 rounded-md border border-main/30 " +
                "bg-inverted px-2.5 py-1.5 text-white/90 dark:text-black/90 text-xs shadow-lg " +
                "fixed z-[9999] pointer-events-none",
                className,
            )}
            style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: "translate(-50%, calc(-100% - 8px))",
            }}
        >
            {!nestLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload.map((item, index) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`
                    const itemConfig = getPayloadConfigFromPayload(config, item, key)
                    const indicatorColor = color || item.payload.fill || item.color

                    return (
                        <div
                            key={item.dataKey}
                            className={cn(
                                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 " + "[&>svg]:w-2.5 [&>svg]:text-secondary",
                                indicator === "dot" && "items-center",
                            )}
                        >
                            {formatter && item?.value !== undefined && item.name ? (
                                formatter(item.value, item.name, item, index, item.payload)
                            ) : (
                                <>
                                    {itemConfig?.icon ? (
                                        <itemConfig.icon />
                                    ) : (
                                        !hideIndicator && (
                                            <div
                                                className={cn("shrink-0 rounded-[2px]", {
                                                    "h-2.5 w-2.5": indicator === "dot",
                                                    "w-1": indicator === "line",
                                                    "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                                                    "my-0.5": nestLabel && indicator === "dashed",
                                                })}
                                                style={{
                                                    backgroundColor: indicator !== "dashed" ? indicatorColor : "transparent",
                                                    borderColor: indicatorColor,
                                                }}
                                            />
                                        )
                                    )}
                                    <div
                                        className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}
                                    >
                                        <div className="grid gap-1.5">
                                            {nestLabel ? tooltipLabel : null}
                                            <span className="text-white/70 dark:text-black/70">{itemConfig?.label || item.name}</span>
                                        </div>
                                        {item.value && (
                                            <span className="font-mono font-medium tabular-nums text-white/70 dark:text-black/70">
                        {item.value.toLocaleString()}
                      </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return createPortal(tooltipContent, document.body)
}

const ChartLegendContent = ({
                                className,
                                hideIcon = false,
                                payload,
                                verticalAlign = "bottom",
                                nameKey,
                            }: ChartLegendContentProps) => {
    const { config } = useChart()

    if (!payload?.length) return null

    return (
        <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
            {payload.map((item) => {
                const key = `${nameKey || item.dataKey || "value"}`
                const itemConfig = getPayloadConfigFromPayload(config, item, key)

                return (
                    <div
                        key={item.value}
                        className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-secondary")}
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                        )}
                        {itemConfig?.label}
                    </div>
                )
            })}
        </div>
    )
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
    if (typeof payload !== "object" || payload === null) return undefined

    const payloadPayload =
        "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
            ? payload.payload
            : undefined

    let configLabelKey: string = key

    if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
        configLabelKey = payload[key as keyof typeof payload] as string
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
    ) {
        configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
    }

    return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export {
    type ChartConfig,
    ChartLegend,
    ChartTooltip,
    ChartContainer,
    ChartTooltipContent,
    ChartLegendContent,
    ChartStyle,
}
