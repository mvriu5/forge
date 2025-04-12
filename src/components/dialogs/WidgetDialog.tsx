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

function WidgetDialog({editMode, title}: {editMode: boolean, title?: string}) {
    const {widgets, addWidget} = useWidgetStore()
    const {session} = useSessionStore()
    const [selectedWidget, setSelectedWidget] = useState<WidgetPreview | null>(null)
    const [allWidgets] = useState<WidgetPreview[]>(getAllWidgetPreviews())
    const [query, setQuery] = useState<string>("")
    const [tagValue, setTagValue] = useState<string>("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const widgetTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new widget",
        anchor: "bc",
        offset: 12
    })

    const filteredWidgets = allWidgets.filter((widget) => {
        const matchesSearch = widget.title.toLowerCase().includes(query.toLowerCase())
        const matchesTags = tagValue === "" || widget.tags?.some((tag: any) => tag === tagValue)
        return matchesSearch && matchesTags
    })

    const handleSelect = (widgetPreview: WidgetPreview) => {
        if (widgets?.find((w) => w.widgetType === widgetPreview?.widgetType)) return
        if (selectedWidget) setSelectedWidget(null)
        else setSelectedWidget(widgetPreview)
    }

    const handleAddWidget = () => {
        if (!selectedWidget) return
        if (!session || !session.user) return

        addWidget(session.user.id, {
            userId: session.user.id,
            widgetType: selectedWidget.widgetType,
            height: selectedWidget.height,
            width: selectedWidget.width,
            positionX: 0,
            positionY: 0,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        })

        setDialogOpen(false)
        setSelectedWidget(null)
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
            <DialogContent className={"min-w-[800px] pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-center pr-4"}>
                    <DialogTitle>
                        <p className={"flex items-center gap-2"}>
                            Select a widget
                            <span className={"inline break-words text-tertiary font-normal"}>{`(${allWidgets.length})`}</span>
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
                        <ToggleGroupItem value="notes" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Notes
                        </ToggleGroupItem>
                        <ToggleGroupItem value="github" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Github
                        </ToggleGroupItem>
                        <ToggleGroupItem value="stock" className={"text-sm px-2 h-8 data-[state=on]:bg-brand/5 data-[state=on]:text-brand data-[state=on]:border-brand/20 border border-main/60"}>
                            Stock
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <ScrollArea className="h-96 pr-4">
                    <div className="grid grid-cols-2 gap-8">
                        {filteredWidgets.map((widget) => (
                            <div
                                key={widget.widgetType}
                                data-used={widgets?.find((w) => w.widgetType === widget.widgetType) ? "true" : "false"}
                                data-selected={widget.widgetType === selectedWidget?.widgetType ? "true" : "false"}
                                className={cn(
                                    "group col-span-1 flex flex-col p-2 h-48 bg-secondary rounded-md overflow-hidden border border-main/40",
                                    "data-[selected=true]:border-brand data-[used=true]:border-success/60"
                                )}
                                onClick={() => handleSelect(widget)}
                            >
                                <div className={"flex justify-between items-center"}>
                                    <p className={"text-primary"}>{widget.title}</p>
                                    <div className={"px-2 rounded-md bg-white/10 border border-main/20 group-data-[used=true]:bg-success/20 group-data-[used=true]:text-primary"}>
                                        {widgets?.find((w) => w.widgetType === widget.widgetType) ?
                                            "In use" :
                                            `${widget.width}x${widget.height}`
                                        }
                                    </div>
                                </div>
                                <p className={"text-sm text-secondary"}>{widget.description}</p>
                                <Image src={widget.previewImage} alt={widget.title} width={236} height={300} className={"mt-2 rounded-md opacity-50"}/>
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
                        Add widget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export {WidgetDialog}