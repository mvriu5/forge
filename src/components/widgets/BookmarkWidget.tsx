import React, {useState} from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {getLogoFromLink} from "@/components/svg/BookmarkIcons"
import {Button} from "@/components//ui/Button"
import {Bookmark, Link, Trash} from "lucide-react"
import {tooltip} from "@/components/ui/TooltipProvider"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/Popover"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useWidgetStore} from "@/store/widgetStore"
import { WidgetHeader } from "./base/WidgetHeader"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {useDashboardStore} from "@/store/dashboardStore"
import {WidgetEmpty} from "@/components/widgets/base/WidgetEmpty"

interface BookmarkItem {
    title: string
    link: string
}

const BookmarkWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
    if (isPlaceholder) {
        const data = [
            {
                title: "Amazon Wishlist",
                link: "https://amazon.com/"
            },
            {
                title: "Youtube - Watch later",
                link: "https://www.youtube.com/"
            },
            {
                title: "Github repo",
                link: "https://github.com/"
            }
        ]

        return (
            <WidgetTemplate id={id} className={"col-span-1 row-span-2"} name={"bookmark"} editMode={editMode} onWidgetDelete={onWidgetDelete} isPlaceholder={true}>
                <WidgetHeader title={"Bookmark"}>
                    <Button className={"bg-tertiary gap-1 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
                        <Bookmark size={18}/>
                        Add
                    </Button>
                </WidgetHeader>
                <div className={"w-full h-px border-b border-main/40"}/>
                <WidgetContent scroll>
                    {data.map((bookmark) => (
                        <BookmarkItem key={bookmark.title} title={bookmark.title} link={bookmark.link} onDelete={() => handleDelete(bookmark.title)}/>
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

    const handleAdd = async (bookmark: BookmarkItem) => {
        const updatedBookmarks = bookmarks.find(b => b.title === bookmark.title)
            ? bookmarks
            : [...bookmarks, bookmark];

        setBookmarks(updatedBookmarks);

        await refreshWidget({
            ...widget,
            config: {
                bookmarks: updatedBookmarks
            }
        })

        setOpen(false)
        form.reset()
    }

    const handleDelete = async (title: string) => {
        const updatedBookmarks = bookmarks.filter((b) => b.title !== title);

        setBookmarks(updatedBookmarks);

        await refreshWidget({
            ...widget,
            config: {
                bookmarks: updatedBookmarks
            }
        })
    }

    return (
        <WidgetTemplate id={id} className={"col-span-1 row-span-2"} name={"bookmark"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Bookmark"}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button className={"bg-tertiary gap-1 data-[state=open]:bg-inverted/10 data-[state=open]:text-primary"}>
                            <Bookmark size={18}/>
                            Add
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
            <div className={"w-full h-px border-b border-main/40"}/>
            {bookmarks.length > 0 ? (
                <WidgetContent scroll>
                    {bookmarks.map((bookmark) => (
                        <BookmarkItem key={bookmark.title} title={bookmark.title} link={bookmark.link} onDelete={() => handleDelete(bookmark.title)}/>
                    ))}
                </WidgetContent>
            ) : (
                <WidgetEmpty message={" No bookmarks yet."}/>
            )}
        </WidgetTemplate>
    )
}


const BookmarkItem = ({title, link, onDelete}: BookmarkItem & {onDelete: (title: string) => void}) => {

    const linkTooltip = tooltip<HTMLDivElement>({
        message: link
    })

    return (
        <div
            className={"group w-full flex items-center gap-2 justify-between rounded-md hover:bg-secondary p-2 cursor-pointer overflow-hidden"}
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
        >
            <div className={"flex items-center gap-2"}>
                <div className={"flex justify-center items-center p-1 rounded-md bg-white/10"}>
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