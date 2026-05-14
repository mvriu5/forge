"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { useDashboards } from "@/hooks/data/useDashboards"
import { useSettings } from "@/hooks/data/useSettings"
import { useWidgets } from "@/hooks/data/useWidgets"
import { authClient } from "@/lib/auth-client"
import { definitions, type WidgetDefinition } from "@/lib/definitions"
import { capitalizeFirstLetter, cn } from "@/lib/utils"
import { Grid2x2Plus } from "lucide-react"
import Image from "next/image"
import {
    type KeyboardEvent as ReactKeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { FrameWidgetDialog } from "./FrameWidgetDialog"

interface WidgetDialogProps {
    editMode: boolean
    isOnboarding: boolean
    title?: string
}

const WIDGET_GRID_COLUMNS = 2

function WidgetDialog({ editMode, title }: WidgetDialogProps) {
    const { data: session } = authClient.useSession()
    const { settings } = useSettings(session?.user.id)
    const { currentDashboard } = useDashboards(session?.user.id, settings)
    const { widgets, addWidget, addWidgetStatus } = useWidgets(session?.user.id)

    const [selectedWidgets, setSelectedWidgets] = useState<WidgetDefinition[]>(
        [],
    )
    const [query, setQuery] = useState("")
    const [tagValue, setTagValue] = useState("")
    const [, setActiveWidgetIndex] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [frameDialogState, setFrameDialogState] = useState<{open: boolean, widget: WidgetDefinition | null}>({ open: false, widget: null })
    const scrollViewportRef = useRef<HTMLDivElement | null>(null)
    const widgetButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
    const [scrollEdges, setScrollEdges] = useState({ canScrollUp: false, canScrollDown: false })

    const widgetTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new widget",
        anchor: "bc",
        offset: 12,
    })

    const widgetCategories = useMemo(() => {
        const tags = definitions.flatMap((d) => d.tags ?? [])
        return Array.from(new Set(tags))
    }, [])

    const filteredWidgets = useMemo(() => {
        return definitions.filter((widget) => {
            const normalizedQuery = query.trim().toLowerCase()
            const matchesSearch =
                normalizedQuery === "" ||
                [widget.name, widget.description, ...widget.tags].some(
                    (value) => value.toLowerCase().includes(normalizedQuery),
                )
            const matchesTags =
                tagValue === "" || widget.tags?.includes(tagValue)
            return matchesSearch && matchesTags
        })
    }, [query, tagValue])

    const updateScrollEdges = useCallback(() => {
        const viewport = scrollViewportRef.current
        if (!viewport) return

        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight
        setScrollEdges({
            canScrollUp: viewport.scrollTop > 1,
            canScrollDown: viewport.scrollTop < maxScrollTop - 1,
        })
    }, [])

    useEffect(() => {
        const frame = requestAnimationFrame(updateScrollEdges)
        return () => cancelAnimationFrame(frame)
    }, [filteredWidgets, dialogOpen, updateScrollEdges])

    const focusWidget = useCallback((index: number) => {
        const widgetCount = filteredWidgets.length
        if (widgetCount === 0) return

        const wrappedIndex = ((index % widgetCount) + widgetCount) % widgetCount
        setActiveWidgetIndex(wrappedIndex)
        widgetButtonRefs.current[wrappedIndex]?.focus()
    }, [filteredWidgets.length])

    const handleSelect = (widgetPreview: WidgetDefinition) => {
        if (!currentDashboard) return

        if (
            widgetPreview.name !== "Frame" &&
            widgets?.find(
                (w) =>
                    w.widgetType === widgetPreview?.name &&
                    w.dashboardId === currentDashboard.id,
            )
        )
            return

        setSelectedWidgets((prev) => {
            const exists = prev.some((w) => w.name === widgetPreview.name)
            if (exists) return prev.filter((w) => w.name !== widgetPreview.name)
            return [...prev, widgetPreview]
        })
    }

    const handleWidgetKeyDown = (
        event: ReactKeyboardEvent<HTMLButtonElement>,
        index: number,
    ) => {
        if (filteredWidgets.length === 0) return

        const keyOffset = {
            ArrowRight: 1,
            ArrowLeft: -1,
            ArrowDown: WIDGET_GRID_COLUMNS,
            ArrowUp: -WIDGET_GRID_COLUMNS,
        }[event.key]

        if (typeof keyOffset !== "number") return

        event.preventDefault()
        focusWidget(index + keyOffset)
    }

    const handleSearchKeyDown = (
        event: ReactKeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key !== "ArrowDown" || filteredWidgets.length === 0) return

        event.preventDefault()
        focusWidget(0)
    }

    const handleAddWidget = async () => {
        if (
            selectedWidgets.length <= 0 ||
            !session?.user.id ||
            !currentDashboard
        )
            return

        try {
            for (const widget of selectedWidgets) {
                if (widget.name === "Frame") {
                    setFrameDialogState({ open: true, widget: widget })
                    continue
                }

                await addWidget({
                    userId: session?.user.id,
                    dashboardId: currentDashboard.id,
                    widgetType: widget.name,
                    height: widget.sizes.desktop.height,
                    width: widget.sizes.desktop.width,
                    positionX: 0,
                    positionY: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        } catch {
            toast.error("Something went wrong")
        }

        setDialogOpen(false)
        setSelectedWidgets([])
        setQuery("")
        setTagValue("")
        setActiveWidgetIndex(0)
    }

    const isAddDisabled =
        selectedWidgets.length <= 0 ||
        !session?.user.id ||
        !currentDashboard ||
        addWidgetStatus === "pending"

    const handleSaveFrameWidget = async (data: { url: string; sizes: any }) => {
        if (!session?.user.id || !currentDashboard || !frameDialogState.widget)
            return

        try {
            await addWidget({
                userId: session.user.id,
                dashboardId: currentDashboard.id,
                widgetType: frameDialogState.widget.name,
                height: data.sizes.desktop.height,
                width: data.sizes.desktop.width,
                positionX: 0,
                positionY: 0,
                config: {
                    url: data.url,
                    sizes: data.sizes,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        } catch {
            toast.error("Something went wrong")
        }

        setDialogOpen(false)
    }

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(prev) => {
                setDialogOpen(prev)
                setSelectedWidgets([])
                setQuery("")
                setTagValue("")
                setActiveWidgetIndex(0)
            }}
        >
            <DialogTrigger asChild>
                <Button
                    className={"px-1.5 gap-2"}
                    {...widgetTooltip}
                    variant={"brand"}
                    disabled={
                        editMode || !currentDashboard || !session?.user.id
                    }
                >
                    <Grid2x2Plus size={16} />
                    {title}
                </Button>
            </DialogTrigger>
            <DialogContent
                className={"md:min-w-200 max-w-[90vw] sm:w-max  pl-8 pt-8"}
            >
                <DialogHeader
                    className={
                        "flex flex-row justify-between items-center pr-4"
                    }
                >
                    <DialogTitle>
                        <div className={"flex items-center gap-2"}>
                            <p>Select a widget</p>
                            <span
                                className={
                                    "inline wrap-break-word text-tertiary font-normal bg-tertiary rounded-md px-1 py-1"
                                }
                            >
                                {filteredWidgets.length}
                            </span>
                        </div>
                    </DialogTitle>
                    <DialogDescription className={"sr-only"}>
                        Search widgets, filter by category, and use arrow keys
                        to move through the widget grid.
                    </DialogDescription>
                    <DialogClose />
                </DialogHeader>
                <div className={"flex pr-4 w-full"}>
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setActiveWidgetIndex(0)
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={
                            "Search widgets by name, tag, or description"
                        }
                        className={"w-full border-main/60 -mb-2"}
                        autoFocus
                    />
                </div>
                <div className={"flex"}>
                    <ToggleGroup type="single" className={"border-0 bg-transparent px-0"} value={tagValue} onValueChange={(tag) => {
                        setTagValue(tag)
                        setActiveWidgetIndex(0)
                    }}>
                        {widgetCategories.map(category => (
                            <ToggleGroupItem key={category} value={category} className={"px-2 h-7 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                                {capitalizeFirstLetter((category))}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="relative">
                    <ScrollArea
                        className="h-96 pr-4"
                        viewportRef={scrollViewportRef}
                        onViewportScroll={updateScrollEdges}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredWidgets.map((widget, index) => {
                                const isWidgetInUse = widget.name !== 'Frame' && widgets?.find((w) => w.widgetType === widget.name && w.dashboardId === currentDashboard?.id);
                                return (
                                    <button
                                        type="button"
                                        key={widget.name}
                                        ref={(node) => {
                                            widgetButtonRefs.current[index] = node
                                        }}
                                        data-used={isWidgetInUse ? "true" : "false"}
                                        data-selected={selectedWidgets.some((w) => w.name === widget.name) ? "true" : "false"}
                                        className={cn(
                                            "relative group text-left cursor-default col-span-1 flex flex-col p-2 m-1 h-48 bg-secondary rounded-md overflow-hidden border border-main/40",
                                            "data-[selected=true]:border-brand/30 data-[used=true]:border-success/30",
                                            "data-[used=true]:ring-4 data-[used=true]:ring-success/10",
                                            "data-[selected=true]:ring-4 data-[selected=true]:ring-brand/10",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                                        )}
                                        onClick={() => handleSelect(widget)}
                                        onKeyDown={(event) => handleWidgetKeyDown(event, index)}
                                        onFocus={() => setActiveWidgetIndex(index)}
                                    >
                                        <div className={"flex justify-between items-center"}>
                                            <p className={"text-primary relative z-10"}>{widget.name}</p>
                                            <div className={"px-2 rounded-md bg-white/5 border border-main/40 group-data-[used=true]:bg-success/10 group-data-[used=true]:text-success group-data-[used=true]:border-success/20"}>
                                                {isWidgetInUse ?
                                                    "In use" :
                                                    `${widget.sizes.desktop.width}x${widget.sizes.desktop.height}`
                                                }
                                            </div>
                                        </div>
                                        <p className={"text-sm text-secondary relative z-10"}>{widget.description}</p>
                                        <div className={"absolute left-4 -bottom-32 sm:-bottom-8 md:-bottom-16 rounded-xl shadow-md pt-0.5 pl-0.5 ml-4 border border-main/40 bg-secondary pointer-events-none z-0"}>
                                            <Image
                                                src={widget.image}
                                                alt={widget.name}
                                                width="0"
                                                height="0"
                                                sizes="100vw"

                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    {scrollEdges.canScrollUp && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-primary to-transparent" />
                    )}
                    {scrollEdges.canScrollDown && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-primary to-transparent" />
                    )}
                </div>

                <DialogFooter className={"pr-4"}>
                    <Button
                        variant={"brand"}
                        disabled={isAddDisabled}
                        onClick={handleAddWidget}
                    >
                        {addWidgetStatus === "pending" && <Spinner />}
                        {selectedWidgets.length > 1
                            ? "Add widgets"
                            : "Add widget"}
                    </Button>
                </DialogFooter>
            </DialogContent>
            <FrameWidgetDialog
                open={frameDialogState.open}
                onOpenChange={(open) =>
                    setFrameDialogState({ open, widget: null })
                }
                widget={frameDialogState.widget}
                onSave={handleSaveFrameWidget}
            />
        </Dialog>
    )
}

export { WidgetDialog }
