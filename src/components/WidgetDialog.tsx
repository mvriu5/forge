"use client"

import {Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, tooltip} from "lunalabs-ui"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {Grid2x2Plus} from "lucide-react"
import {ScrollArea} from "@radix-ui/react-scroll-area"

const widgets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function WidgetDialog() {

    const widgetTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new widget",
        anchor: "bc",
        offset: 12
    })

    return (
        <Dialog>
            <DialogTrigger>
                <Button className={"bg-brand hover:bg-brand/80 text-primary border-0 size-8"} {...widgetTooltip}>
                    <Grid2x2Plus size={16}/>
                </Button>
            </DialogTrigger>
            <DialogContent className={""}>
                <ScrollArea className={"h-96"}>
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>
                                Add a new widget
                            </DialogTitle>
                        </DialogHeader>
                    </VisuallyHidden>
                    <Input placeholder={"Search widgets"} className={"w-full"}/>
                        <div className={"grid grid-cols-2 gap-4"}>
                            {widgets.map(widget => (
                                <div key={widget} className={"col-span-1 h-60 bg-secondary rounded-md"}/>
                            ))}
                        </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export {WidgetDialog}