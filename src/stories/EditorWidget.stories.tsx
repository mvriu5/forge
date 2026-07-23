import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Editor", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Editor",
        config: {
            notes: [
                {
                    id: "note-1",
                    title: "Design review",
                    content: { type: "doc", content: [] },
                    createdAt: "2026-01-01T10:00:00.000Z",
                    updatedAt: "2026-01-01T10:00:00.000Z",
                },
            ],
        },
        mockData: { pages: [{ id: "page-1", title: "Product requirements", isChild: false, parentId: null }] },
    },
}
