import React, {useCallback, useState} from "react"
import {getLogoFromLink} from "@/components/svg/BookmarkIcons"
import {Button} from "@/components//ui/Button"
import {Link, Plus, Trash} from "lucide-react"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {WidgetHeader} from "./base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import type {WidgetPreview, WidgetRuntimeInnerProps } from "@forge/sdk"
import { createWidget } from "@forge/sdk"

interface BookmarkItem {
    id: string
    title: string
    link: string
}

interface BookmarkConfig {
    bookmarks: BookmarkItem[]
}

const formSchema = z.object({
    title: z.string().nonempty({message: "Title is required"}),
    link: z.url({message: "Invalid URL"}).nonempty({message: "Link is required"}),
})

const BookmarkWidget: React.FC<WidgetRuntimeInnerProps<BookmarkConfig>> = ({config, updateConfig}) => {
    const [open, setOpen] = useState<boolean>(false)
    const {bookmarks} = config

    const addTooltip = useTooltip<HTMLButtonElement>({
        message: "Add a new bookmark",
        anchor: "tc"
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            link: ""
        },
    })

    const handleSave = useCallback(async (updatedBookmarks: BookmarkItem[]) => {
        await updateConfig({ bookmarks: updatedBookmarks })
    }, [updateConfig])

    const handleAdd = async (data: z.infer<typeof formSchema>) => {
        const newBookmark: BookmarkItem = {
            id: `bookmark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: data.title,
            link: data.link,
        }
        const updatedBookmarks = [...bookmarks, newBookmark]
        await handleSave(updatedBookmarks)
        setOpen(false)
        form.reset()
    }

    const handleDelete = useCallback(async (idToDelete: string) => {
        const updatedBookmarks = bookmarks.filter((b) => b.id !== idToDelete)
        await handleSave(updatedBookmarks)
    }, [bookmarks, handleSave])

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    )

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = bookmarks.findIndex((item) => item.id === active.id)
        const newIndex = bookmarks.findIndex((item) => item.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        const newOrder = arrayMove(bookmarks, oldIndex, newIndex)
        void handleSave(newOrder)
    }, [bookmarks, handleSave])

    return (
        <>
            <WidgetHeader title={"Bookmark"}>
                <Popover
                    open={open}
                    onOpenChange={(open) => {
                        setOpen (open)
                        if (!open) form.reset()
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button variant={"widget"} className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"} {...addTooltip}>
                            <Plus size={16}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={"w-56"} align={"end"}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormInput placeholder="Title" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL</FormLabel>
                                            <FormInput placeholder="URL" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className={"w-full mt-2"}
                                >
                                    Add link
                                </Button>

                            </form>
                        </Form>
                    </PopoverContent>
                </Popover>
            </WidgetHeader>
            {bookmarks.length > 0 ? (
                <WidgetContent scroll>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext
                            items={bookmarks.map((bookmark) => bookmark.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {bookmarks.map((bookmark) => (
                                <BookmarkItem key={bookmark.id} id={bookmark.id} title={bookmark.title} link={bookmark.link} onDelete={() => handleDelete(bookmark.id)}/>
                            ))}
                        </SortableContext>
                    </DndContext>
                </WidgetContent>
            ) : (
                <WidgetEmpty message={" No bookmarks yet."}/>
            )}
        </>
    )
}


const BookmarkItem = ({id, title, link, onDelete}: BookmarkItem & {onDelete: (title: string) => void}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.8 : 1
    }

    const linkTooltip = useTooltip<HTMLDivElement>({
        message: link
    })

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={"group w-full flex items-center gap-2 justify-between rounded-md hover:bg-secondary p-2 cursor-pointer overflow-hidden"}
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
        >
            <div className={"flex items-center gap-2"}>
                <div className={"flex justify-center items-center p-1 rounded-md bg-white/50 dark:bg-white/10"}>
                    {getLogoFromLink(link)}
                </div>
                <p className={"text-primary truncate"}>{title}</p>
                <div className={"h-4 w-px border-r border-main"}/>
                <div {...linkTooltip}>
                    <Link size={12}/>
                </div>

            </div>

            <Button
                className={"hidden group-hover:flex px-1 h-6"}
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(title)
                }}
            >
                <Trash size={14}/>
            </Button>
        </div>
    )
}


export const bookmarkWidgetDefinition = createWidget<BookmarkConfig>({
    type: "bookmark",
    preview: {
        previewImage: "/bookmark_preview.svg",
        title: "Bookmark",
        description: "Store your bookmarks",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 },
        },
    },
    defaultConfig: {
        bookmarks: [],
    },
    Content: BookmarkWidget,
})

export {BookmarkWidget}