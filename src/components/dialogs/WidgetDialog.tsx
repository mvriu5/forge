"use client"

import {Button} from "@/components/ui/Button"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter} from "@/components/ui/Dialog"
import {Input} from "@/components/ui/Input"
import {Grid2x2Plus, PanelsTopLeft} from "lucide-react"
import React, { useState } from "react"
import {cn} from "@/lib/utils"
import Image from "next/image"
import {useWidgetStore} from "@/store/widgetStore"
import {useSessionStore} from "@/store/sessionStore"
import {getAllWidgetPreviews, type WidgetPreview} from "@/lib/widgetRegistry"
import { tooltip } from "@/components/ui/TooltipProvider"
import {ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { ScrollArea } from "@/components/ui/ScrollArea"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {useDashboardStore} from "@/store/dashboardStore"
import {useHotkeys} from "react-hotkeys-hook"

function WidgetDialog({editMode, title}: {editMode: boolean, title?: string}) {
    const {widgets, addWidget} = useWidgetStore()
    const {currentDashboard} = useDashboardStore()
    const {session} = useSessionStore()
    const [selectedWidget, setSelectedWidget] = useState<WidgetPreview | null>(null)
    const [allWidgets] = useState<WidgetPreview[]>(getAllWidgetPreviews())
    const [query, setQuery] = useState<string>("")
    const [tagValue, setTagValue] = useState<string>("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [addLoading, setAddLoading] = useState<boolean>(false)

    useHotkeys("mod+s", (event) => {
        event.preventDefault()
        if (!title) return
        if (!dialogOpen) setDialogOpen(true)
    }, [dialogOpen])

    const widgetTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new widget",
        shortcut: "S",
        anchor: "bc",
        offset: 12
    })

    const filteredWidgets = allWidgets.filter((widget) => {
        const matchesSearch = widget.title.toLowerCase().includes(query.toLowerCase())
        const matchesTags = tagValue === "" || widget.tags?.some((tag: any) => tag === tagValue)
        return matchesSearch && matchesTags
    })

    const handleSelect = (widgetPreview: WidgetPreview) => {
        if (widgets?.find((w) => w.widgetType === widgetPreview?.widgetType && w.dashboardId === currentDashboard?.id)) return
        if (selectedWidget) setSelectedWidget(null)
        else setSelectedWidget(widgetPreview)
    }

    const handleAddWidget = async () => {
        if (!selectedWidget) return
        if (!session || !session.user) return
        if (!currentDashboard) return
        setAddLoading(true)

        await addWidget(session.user.id, {
            userId: session.user.id,
            dashboardId: currentDashboard.id,
            widgetType: selectedWidget.widgetType,
            height: selectedWidget.height,
            width: selectedWidget.width,
            positionX: 0,
            positionY: 0,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        }).then(() => {
            setDialogOpen(false)
            setSelectedWidget(null)
            setAddLoading(false)
        })
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={() => {
            setDialogOpen(!dialogOpen)
            if (selectedWidget) setSelectedWidget(null)
        }}>
            <DialogTrigger asChild>
                <Button className={"px-1.5 gap-2"} {...widgetTooltip} variant={"brand"} disabled={editMode}>
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
                                    "relative group cursor-default col-span-1 flex flex-col p-2 h-48 bg-secondary rounded-md overflow-hidden border border-main/40",
                                    "data-[selected=true]:border-brand/60 data-[used=true]:border-success/20 data-[selected=true]:bg-tertiary"
                                )}
                                onClick={() => handleSelect(widget)}
                            >
                                <div className={"flex justify-between items-center"}>
                                    <p className={"text-primary"}>{widget.title}</p>
                                    <div className={"px-2 rounded-md bg-white/5 border border-main/40 group-data-[used=true]:bg-success/10 group-data-[used=true]:text-success group-data-[used=true]:border-success/20"}>
                                        {widgets?.find((w) => w.widgetType === widget.widgetType && w.dashboardId === currentDashboard?.id) ?
                                            "In use" :
                                            `${widget.width}x${widget.height}`
                                        }
                                    </div>
                                </div>
                                <p className={"text-sm text-secondary"}>{widget.description}</p>
                                <div className={"absolute -right-2 -bottom-6 rounded-md shadow-md pt-0.5 pl-0.5 border border-main/40 bg-secondary"}>
                                    <Image src={widget.previewImage} alt={widget.title} width={330} height={300}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className={"pr-4"}>
                    <Button
                        variant={"brand"}
                        disabled={!selectedWidget}
                        onClick={handleAddWidget}
                    >
                        {addLoading && <ButtonSpinner/>}
                        Add widget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export {WidgetDialog}