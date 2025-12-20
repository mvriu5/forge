"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { useTooltip } from "@/components/ui/TooltipProvider"
import { useDashboards } from "@/hooks/data/useDashboards"
import { useSession } from "@/hooks/data/useSession"
import { useSettings } from "@/hooks/data/useSettings"
import { useWidgets } from "@/hooks/data/useWidgets"
import { definitions } from "@/lib/definitions"
import { cn } from "@/lib/utils"
import { capitalizeFirstLetter } from "@better-auth/core/utils"
import { WidgetDefinition } from "@tryforgeio/sdk"
import { Grid2x2Plus } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"

interface WidgetDialogProps {
    editMode: boolean
    isOnboarding: boolean
    title?: string
}

function WidgetDialog({editMode, isOnboarding, title}: WidgetDialogProps) {
    const {userId} = useSession()
    const {settings} = useSettings(userId)
    const {currentDashboard} = useDashboards(userId, settings)
    const {widgets, addWidget, addWidgetStatus} = useWidgets(userId)

    const [selectedWidgets, setSelectedWidgets] = useState<WidgetDefinition[]>([])
    const [query, setQuery] = useState("")
    const [tagValue, setTagValue] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    useHotkeys("mod+s", (event) => {
        event.preventDefault()
        if (!title || editMode || isOnboarding) return
        if (!dialogOpen) setDialogOpen(true)
    }, [dialogOpen, title])

    const widgetTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new widget",
        shortcut: "S",
        anchor: "bc",
        offset: 12
    })

    const widgetCategories = useMemo(() => {
        const tags = definitions.flatMap(d => d.tags ?? []);
        return Array.from(new Set(tags));
    }, [])

    const filteredWidgets = useMemo(() => {
        return definitions.filter((widget) => {
            const matchesSearch = widget.name.toLowerCase().includes(query.toLowerCase())
            const matchesTags = tagValue === "" || widget.tags?.some((tag: any) => tag === tagValue)
            return matchesSearch && matchesTags
        })
    }, [query, tagValue])

    const handleSelect = (widgetPreview: WidgetDefinition) => {
        if (!currentDashboard) return
        if (widgets?.find((w) => w.widgetType === widgetPreview?.name && w.dashboardId === currentDashboard.id)) return

        setSelectedWidgets(prev => {
            const exists = prev.some(w => w.name === widgetPreview.name)
            if (exists) return prev.filter(w => w.name !== widgetPreview.name)
            return [...prev, widgetPreview]
        })
    }

    const handleAddWidget = async () => {
        if (selectedWidgets.length <= 0 || !userId || !currentDashboard) return

        try {
            for (const widget of selectedWidgets) {
                await addWidget({
                    userId,
                    dashboardId: currentDashboard.id,
                    widgetType: widget.name,
                    height: widget.sizes.desktop.height,
                    width: widget.sizes.desktop.width,
                    positionX: 0,
                    positionY: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
            }
        } catch (err) {
            toast.error("Something went wrong")
        }

        setDialogOpen(false)
        setSelectedWidgets([])
    }

    const isAddDisabled =  selectedWidgets.length <= 0 || !userId || !currentDashboard || addWidgetStatus === "pending"

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(prev) => {
                setDialogOpen(prev)
                if (selectedWidgets) setSelectedWidgets([])
            }}
        >
            <DialogTrigger asChild>
                <Button className={"px-1.5 gap-2"} {...widgetTooltip} variant={"brand"} disabled={editMode || !currentDashboard || !userId}>
                    <Grid2x2Plus size={16}/>
                    {title}
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-200 pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-center pr-4"}>
                    <DialogTitle>
                        <div className={"flex items-center gap-2"}>
                            <p>Select a widget</p>
                            <span className={"inline wrap-break-word text-tertiary font-normal bg-tertiary rounded-md px-1 py-1"}>{filteredWidgets.length}</span>
                        </div>
                    </DialogTitle>
                    <DialogDescription className={"sr-only"}/>
                    <DialogClose/>
                </DialogHeader>
                <div className={"flex pr-4 w-full"}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={"Search widgets"}
                        className={"w-full border-main/60 -mb-2"}
                        autoFocus
                    />
                </div>
                <div className={"flex"}>
                    <ToggleGroup type="single" className={"border-0 bg-transparent px-0"} value={tagValue} onValueChange={(tag) => setTagValue(tag)}>
                        {widgetCategories.map(category => (
                            <ToggleGroupItem key={category} value={category} className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                                {capitalizeFirstLetter((category))}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <ScrollArea className="h-96 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredWidgets.map((widget) => (
                            <div
                                key={widget.name}
                                data-used={widgets?.find((w) => w.widgetType === widget.name && w.dashboardId === currentDashboard?.id) ? "true" : "false"}
                                data-selected={selectedWidgets.some((w) => w.name === widget.name) ? "true" : "false"}
                                className={cn(
                                    "relative group cursor-default col-span-1 flex flex-col p-2 m-1 h-48 bg-secondary rounded-md overflow-hidden border border-main/40",
                                    "data-[selected=true]:border-brand/30 data-[used=true]:border-success/30",
                                    "data-[used=true]:ring-4 data-[used=true]:ring-success/10",
                                    "data-[selected=true]:ring-4 data-[selected=true]:ring-brand/10"
                                )}
                                onClick={() => handleSelect(widget)}
                            >
                                <div className={"flex justify-between items-center"}>
                                    <p className={"text-primary"}>{widget.name}</p>
                                    <div className={"px-2 rounded-md bg-white/5 border border-main/40 group-data-[used=true]:bg-success/10 group-data-[used=true]:text-success group-data-[used=true]:border-success/20"}>
                                        {widgets?.find((w) => w.widgetType === widget.name && w.dashboardId === currentDashboard?.id) ?
                                            "In use" :
                                            `${widget.sizes.desktop.width}x${widget.sizes.desktop.height}`
                                        }
                                    </div>
                                </div>
                                <p className={"text-sm text-secondary"}>{widget.description}</p>
                                <div className={"absolute -right-2 -bottom-16 rounded-md shadow-md pt-0.5 pl-0.5 ml-4 border border-main/40 bg-secondary"}>
                                    <Image
                                        src={widget.image}
                                        alt={widget.name}
                                        width="0"
                                        height="0"
                                        sizes="100vw"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className={"pr-4"}>
                    <Button
                        variant={"brand"}
                        disabled={isAddDisabled}
                        onClick={handleAddWidget}
                    >
                        {addWidgetStatus === "pending" && <Spinner/>}
                        {selectedWidgets.length > 1 ? "Add widgets" : "Add widget"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export { WidgetDialog }
