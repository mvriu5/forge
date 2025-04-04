"use client"

import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    Input,
    tooltip,
    DialogFooter,
    ScrollArea, ToggleGroup, ToggleGroupItem
} from "lunalabs-ui"
import {Grid2x2Plus} from "lucide-react"
import React, { useState } from "react"
import {cn} from "@/lib/utils"
import Image from "next/image"
import {useWidgetStore} from "@/store/widgetStore"
import {useSessionStore} from "@/store/sessionStore"
import {getAllWidgetPreviews, type WidgetPreview} from "@/lib/widget"

function WidgetDialog() {
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
        const matchesTags = tagValue === "" || (widget.tags && widget.tags.some((tag: any) => tag === tagValue))

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
                <Button className={"size-8"} {...widgetTooltip} variant={"brand"}>
                    <Grid2x2Plus size={16}/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"min-w-[800px] border-main/40 pl-8 pt-8"}>
                <DialogHeader className={"flex flex-row justify-between items-center pr-4"}>
                    <DialogTitle>
                        {`Select a widget (${allWidgets.length})`}
                    </DialogTitle>
                    <DialogClose/>
                </DialogHeader>
                <div className={"flex pr-4 w-full"}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={"Search widgets"}
                        className={"w-full border-main/60 -mb-2 focus:ring-brand/40"}
                    />
                </div>
                <div className={"flex"}>
                    <ToggleGroup type="single" className={"border-0 bg-transparent px-0"} value={tagValue} onValueChange={(tag) => setTagValue(tag)}>
                        <ToggleGroupItem value="weather" className={"text-sm px-2 h-8 data-[state=on]:bg-tertiary border border-main/60"}>
                            Weather
                        </ToggleGroupItem>
                        <ToggleGroupItem value="notes" className={"text-sm px-2 h-8 data-[state=on]:bg-tertiary border border-main/60"}>
                            Notes
                        </ToggleGroupItem>
                        <ToggleGroupItem value="github" className={"text-sm px-2 h-8 data-[state=on]:bg-tertiary border border-main/60"}>
                            Github
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