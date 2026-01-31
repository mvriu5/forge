"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog"
import { Form, FormField, FormInput, FormItem, FormLabel, FormMessage } from "@/components/ui/Form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { WidgetDefinition } from "@/lib/definitions"

const formSchema = z.object({
    url: z.url({ message: "Please enter a valid URL." }),
    desktop_width: z.number().min(1).max(4),
    desktop_height: z.number().min(1).max(4),
    tablet_width: z.number().min(1).max(2),
    tablet_height: z.number().min(1).max(4),
    mobile_width: z.number().min(1).max(1),
    mobile_height: z.number().min(1).max(4)
})

interface FrameWidgetDialogProps {
    open: boolean
    widget: WidgetDefinition | null
    onOpenChange: (open: boolean) => void
    onSave: (data: { url: string; sizes: any }) => void
}

export function FrameWidgetDialog({ open, widget, onOpenChange, onSave }: FrameWidgetDialogProps) {
    const form = useForm<z.input<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
            desktop_width: widget?.sizes.desktop.width ?? 2,
            desktop_height: widget?.sizes.desktop.height ?? 2,
            tablet_width: widget?.sizes.tablet.width ?? 2,
            tablet_height: widget?.sizes.tablet.height ?? 2,
            mobile_width: widget?.sizes.mobile.width ?? 1,
            mobile_height: widget?.sizes.mobile.height ?? 1,
        },
    })

    const onSubmit = (values: z.input<typeof formSchema>) => {
        onSave({
            url: values.url,
            sizes: {
                desktop: { width: values.desktop_width, height: values.desktop_height },
                tablet: { width: values.tablet_width, height: values.tablet_height },
                mobile: { width: values.mobile_width, height: values.mobile_height }
            }
        })
        onOpenChange(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure Frame Widget</DialogTitle>
                    <DialogDescription>
                        Enter the URL to embed and configure the widget size for different screen sizes.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormInput placeholder="https://example.com" {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <h3 className="text-lg font-medium">Sizes</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <FormField control={form.control} name="desktop_width" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Desktop Width</FormLabel>
                                        <FormInput type="number" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="desktop_height" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Desktop Height</FormLabel>
                                        <FormInput type="number"  {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="tablet_width" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tablet Width</FormLabel>
                                        <FormInput type="number" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="tablet_height" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tablet Height</FormLabel>
                                        <FormInput type="number" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mobile_width" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Width</FormLabel>
                                        <FormInput type="number" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mobile_height" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Height</FormLabel>
                                        <FormInput type="number" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
