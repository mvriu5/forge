import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Bookmark", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Bookmark",
        config: {
            bookmarks: [
                { id: "bookmark-1", title: "Forge Repository", link: "https://github.com/mvriu5/forge" },
                { id: "bookmark-2", title: "Storybook", link: "https://storybook.js.org" },
            ],
        },
        mockData: {},
    },
}
