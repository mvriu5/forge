"use client"

import {Button} from "@/components/ui/Button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/Dialog"
import {Input} from "@/components/ui/Input"
import {CloudAlert, Grid2x2Plus} from "lucide-react"
import React, {useMemo, useState} from "react"
import {cn} from "@/lib/utils"
import Image from "next/image"
import {getAllWidgetPreviews, type WidgetPreview} from "@/lib/widgetRegistry"
import {tooltip} from "@/components/ui/TooltipProvider"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/ToggleGroup"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {useHotkeys} from "react-hotkeys-hook"
import {useToast} from "@/components/ui/ToastProvider"
import {Spinner} from "@/components/ui/Spinner"
import {Dashboard} from "@/database"
import {useWidgets} from "@/hooks/data/useWidgets"

interface WidgetDialogProps {
    editMode: boolean
    title?: string
    currentDashboard?: Dashboard | null
    userId?: string
}

function WidgetDialog({editMode, title, currentDashboard, userId}: WidgetDialogProps) {
    const {widgets, addWidget, addWidgetStatus} = useWidgets(userId)
    const {addToast} = useToast()
    const [selectedWidget, setSelectedWidget] = useState<WidgetPreview | null>(null)
    const [allWidgets] = useState<WidgetPreview[]>(() => getAllWidgetPreviews())
    const [query, setQuery] = useState<string>("")
    const [tagValue, setTagValue] = useState<string>("")
    const [dialogOpen, setDialogOpen] = useState(false)

    useHotkeys("mod+s", (event) => {
        event.preventDefault()
        if (!title) return
        if (!dialogOpen) setDialogOpen(true)
    }, [dialogOpen, title])

    const widgetTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new widget",
        shortcut: "S",
        anchor: "bc",
        offset: 12
    })

    const filteredWidgets = useMemo(() => {
        return allWidgets.filter((widget) => {
            const matchesSearch = widget.title.toLowerCase().includes(query.toLowerCase())
            const matchesTags = tagValue === "" || widget.tags?.some((tag: any) => tag === tagValue)
            return matchesSearch && matchesTags
        })
    }, [allWidgets, query, tagValue])

    const handleSelect = (widgetPreview: WidgetPreview) => {
        if (!currentDashboard) return
        if (widgets?.find((w) => w.widgetType === widgetPreview?.widgetType && w.dashboardId === currentDashboard.id)) return
        if (selectedWidget && selectedWidget.widgetType === widgetPreview.widgetType) setSelectedWidget(null)
        else setSelectedWidget(widgetPreview)
    }

    const handleAddWidget = async () => {
        if (!selectedWidget || !userId || !currentDashboard) return

        try {
            await addWidget({
                userId,
                dashboardId: currentDashboard.id,
                widgetType: selectedWidget.widgetType,
                height: selectedWidget.sizes.desktop.height,
                width: selectedWidget.sizes.desktop.width,
                positionX: 0,
                positionY: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            })
        } catch (err) {
            addToast({
                title: "Error adding widget",
                subtitle:
                    err instanceof Error
                        ? err.message
                        : "Unknown error",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
        }

        setDialogOpen(false)
        setSelectedWidget(null)
    }

    const isAddDisabled = !selectedWidget || !userId || !currentDashboard || addWidgetStatus === "pending"

    return (
        <Dialog open={dialogOpen} onOpenChange={() => {
            setDialogOpen(!dialogOpen)
            if (selectedWidget) setSelectedWidget(null)
        }}>
            <DialogTrigger asChild>
                <Button className={"px-1.5 gap-2"} {...widgetTooltip} variant={"brand"} disabled={editMode || !currentDashboard || !userId}>
                    <Grid2x2Plus size={16}/>
                    {title}
                </Button>
            </DialogTrigger>
            <DialogContent className={"md:min-w-[800px] pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-center pr-4"}>
                    <DialogTitle>
                        <p className={"flex items-center gap-2"}>
                            Select a widget
                            <span className={"inline break-words text-tertiary font-normal"}>{`(${filteredWidgets.length})`}</span>
                        </p>
                    </DialogTitle>
                    <DialogClose/>
                </DialogHeader>
                <div className={"flex pr-4 w-full"}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={"Search widgets"}
                        className={"w-full border-main/60 -mb-2"}
                    />
                </div>
                <div className={"flex"}>
                    <ToggleGroup type="single" className={"border-0 bg-transparent px-0"} value={tagValue} onValueChange={(tag) => setTagValue(tag)}>
                        <ToggleGroupItem value="weather" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60 "}>
                            Weather
                        </ToggleGroupItem>
                        <ToggleGroupItem value="productivity" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Productivity
                        </ToggleGroupItem>
                        <ToggleGroupItem value="github" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Github
                        </ToggleGroupItem>
                        <ToggleGroupItem value="finance" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Finance
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <ScrollArea className="h-96 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredWidgets.map((widget) => (
                            <div
                                key={widget.widgetType}
                                data-used={widgets?.find((w) => w.widgetType === widget.widgetType && w.dashboardId === currentDashboard?.id) ? "true" : "false"}
                                data-selected={widget.widgetType === selectedWidget?.widgetType ? "true" : "false"}
                                className={cn(
                                    "relative group cursor-default col-span-1 flex flex-col p-2 m-1 h-48 bg-secondary rounded-md overflow-hidden border border-main/40",
                                    "data-[selected=true]:border-brand/30 data-[used=true]:border-success/30",
                                    "data-[used=true]:ring-4 data-[used=true]:ring-success/10",
                                    "data-[selected=true]:ring-4 data-[selected=true]:ring-brand/10"
                                )}
                                onClick={() => handleSelect(widget)}
                            >
                                <div className={"flex justify-between items-center"}>
                                    <p className={"text-primary"}>{widget.title}</p>
                                    <div className={"px-2 rounded-md bg-white/5 border border-main/40 group-data-[used=true]:bg-success/10 group-data-[used=true]:text-success group-data-[used=true]:border-success/20"}>
                                        {widgets?.find((w) => w.widgetType === widget.widgetType && w.dashboardId === currentDashboard?.id) ?
                                            "In use" :
                                            `${widget.sizes.desktop.width}x${widget.sizes.desktop.height}`
                                        }
                                    </div>
                                </div>
                                <p className={"text-sm text-secondary"}>{widget.description}</p>
                                <div className={"absolute -right-2 -bottom-16 rounded-md shadow-md pt-0.5 pl-0.5 border border-main/40 bg-secondary"}>
                                    <Image src={widget.previewImage} alt={widget.title} width={330} height={300}/>
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
                        Add widget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export {WidgetDialog}