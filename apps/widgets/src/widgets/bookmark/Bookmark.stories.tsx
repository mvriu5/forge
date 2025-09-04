import type {Meta, StoryObj} from "@storybook/react"
import {BookmarkWidget, type BookmarkItem} from "./BookmarkWidget"
import {getWidgetPreview} from "../widgetRegistry"
import {useBreakpoint} from "@forge/ui/hooks/useBreakpoint"

const meta: Meta<typeof BookmarkWidget> = {
    title: "Components/BookmarkWidget",
    component: BookmarkWidget,
    parameters: { layout: "centered" },
    tags: ["autodocs"]
}

export default meta

type Story = StoryObj<typeof BookmarkWidget>

export const Default: Story = {
    render: () => {
        const widget = getWidgetPreview("bookmark")
        if (!widget) return <div>Error</div>

        const {breakpoint} = useBreakpoint()

        return (
           <BookmarkWidget
               widget={{
                   id: "1",
                   userId: "1",
                   dashboardId: "1",
                   widgetType: widget.preview.widgetType,
                   height: widget.preview.sizes[breakpoint].height,
                   width: widget.preview.sizes[breakpoint].width,
                   config: {},
                   positionX: 0,
                   positionY: 0,
                   createdAt: new Date(),
                   updatedAt: new Date()
               }}
               onUpdateBookmarks={(bm: BookmarkItem[]) => console.log(bm)}
               editMode={false}
               onWidgetDelete={() => {}}
           />
        )
    }
}