import React, {useCallback, useState} from "react"
import {getLogoFromLink} from "@forge/ui/components/svg/BookmarkIcons"
import {Button} from "@forge/ui/components/Button"
import {Link, Plus, Trash} from "lucide-react"
import {tooltip} from "@forge/ui/components/TooltipProvider"
import {Popover, PopoverContent, PopoverTrigger} from "@forge/ui/components/Popover"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@forge/ui/components/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {WidgetHeader} from "../base/WidgetHeader"
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
import {WidgetProps, WidgetTemplate} from "../base/WidgetTemplate"
import {WidgetContent} from "../base/WidgetContent"
import {WidgetEmpty} from "../base/WidgetEmpty"

interface BookmarkItem {
    id: string
    title: string
    link: string
}

interface BookmarkWidgetProps extends WidgetProps {
    onUpdateBookmarks: (bookmarks: BookmarkItem[]) => void
}

const BookmarkWidget: React.FC<BookmarkWidgetProps> = ({widget, editMode, onWidgetDelete, onUpdateBookmarks}) => {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(widget.config?.bookmarks ?? [])
    const [open, setOpen] = useState<boolean>(false)

    const addTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new bookmark",
        anchor: "tc"
    })

    const formSchema = z.object({
        title: z.string().nonempty({message: "Title is required"}),
        link: z.string().url({message: "Invalid URL"}).nonempty({message: "Link is required"}),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            link: ""
        },
    })

    const handleAdd = async (data: z.infer<typeof formSchema>) => {
        const newBookmark: BookmarkItem = {
            id: `bookmark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID
            title: data.title,
            link: data.link,
        }
        const updatedBookmarks = [...bookmarks, newBookmark]
        setBookmarks(updatedBookmarks)
        await onUpdateBookmarks(updatedBookmarks)
        setOpen(false)
        form.reset()
    }

    const handleDelete = useCallback(async (idToDelete: string) => {
        const updatedBookmarks = bookmarks.filter((b) => b.id !== idToDelete)
        setBookmarks(updatedBookmarks)
        await onUpdateBookmarks(updatedBookmarks)
    }, [bookmarks, onUpdateBookmarks])

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

        if (active.id !== over?.id) {
            setBookmarks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)
                const newOrder = arrayMove(items, oldIndex, newIndex)
                onUpdateBookmarks(newOrder)
                return newOrder
            })
        }
    }, [onUpdateBookmarks])

    return (
        <WidgetTemplate widget={widget} editMode={editMode} onWidgetDelete={onWidgetDelete}>
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
                        <Form {...form as any}>
                            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-2">
                                <FormField
                                    control={form.control as any}
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
                                    control={form.control as any}
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
        </WidgetTemplate>
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

    const linkTooltip = tooltip<HTMLDivElement>({
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



export {BookmarkWidget, type BookmarkWidgetProps, type BookmarkItem}