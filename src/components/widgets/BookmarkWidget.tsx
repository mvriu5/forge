import React, {useCallback, useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {getLogoFromLink} from "@/components/svg/BookmarkIcons"
import {Button} from "@/components//ui/Button"
import {Link, Plus, Trash} from "lucide-react"
import {tooltip} from "@/components/ui/TooltipProvider"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useWidgetStore} from "@/store/widgetStore"
import {WidgetHeader} from "./base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {useDashboardStore} from "@/store/dashboardStore"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent, MouseSensor, TouchSensor,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { arrayMove } from "@dnd-kit/sortable"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"

interface BookmarkItem {
    id: string
    title: string
    link: string
}

const BookmarkWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        const data = [
            {
                id: "1",
                title: "Amazon Wishlist",
                link: "https://amazon.com/"
            },
            {
                id: "2",
                title: "Youtube - Watch later",
                link: "https://www.youtube.com/"
            },
            {
                id: "3",
                title: "Github repo",
                link: "https://github.com/"
            }
        ]

        return (
            <WidgetTemplate id={id} name={"bookmark"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader title={"Bookmark"}>
                    <Button variant={"widget"} className={"data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
                        <Plus size={16}/>
                    </Button>
                </WidgetHeader>
                <WidgetContent scroll>
                    {data.map((bookmark) => (
                        <BookmarkItem key={bookmark.id} id={bookmark.id} title={bookmark.title} link={bookmark.link} onDelete={() => handleDelete(bookmark.title)}/>
                    ))}
                </WidgetContent>
            </WidgetTemplate>
        )
    }

    const {getWidget, refreshWidget} = useWidgetStore()
    const {currentDashboard} = useDashboardStore()
    if (!currentDashboard) return

    const widget = getWidget(currentDashboard.id, "bookmark")
    if (!widget) return null

    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(widget.config?.bookmarks ?? [])
    const [open, setOpen] = useState<boolean>(false)

    const addTooltip = tooltip<HTMLButtonElement>({
        message: "Add a new bookmark",
        anchor: "tc"
    })

    const formSchema = z.object({
        title: z.string(),
        link: z.string().url()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            link: ""
        },
    })

    const handleSave = useCallback(async (updatedBookmarks: BookmarkItem[]) => {
        await refreshWidget({
            ...widget,
            config: {
                bookmarks: updatedBookmarks,
            }
        })
    }, [refreshWidget, currentDashboard])

    const handleAdd = async (data: z.infer<typeof formSchema>) => {
        const newBookmark: BookmarkItem = {
            id: `bookmark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID
            title: data.title,
            link: data.link,
        }
        const updatedBookmarks = [...bookmarks, newBookmark]
        setBookmarks(updatedBookmarks)
        await handleSave(updatedBookmarks)
        setOpen(false)
        form.reset()
    }

    const handleDelete = useCallback(async (idToDelete: string) => {
        const updatedBookmarks = bookmarks.filter((b) => b.id !== idToDelete)
        setBookmarks(updatedBookmarks)
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

        if (active.id !== over?.id) {
            setBookmarks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)
                const newOrder = arrayMove(items, oldIndex, newIndex)
                handleSave(newOrder)
                return newOrder
            })
        }
    }, [handleSave])

    return (
        <WidgetTemplate id={id} name={"bookmark"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Bookmark"}>
                <Popover open={open} onOpenChange={setOpen}>
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
                                    variant={"brand"}
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



export {BookmarkWidget}