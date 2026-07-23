import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Kanban", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Kanban",
        config: {
            columns: [
                {
                    id: "todo",
                    title: "To do",
                    color: "#6366f1",
                    cards: [
                        { id: "card-1", title: "Create empty states" },
                        { id: "card-2", title: "Review mobile layout" },
                    ],
                },
                { id: "doing", title: "In progress", color: "#f59e0b", cards: [{ id: "card-3", title: "Polish Storybook stories" }] },
                { id: "done", title: "Done", color: "#10b981", cards: [{ id: "card-4", title: "Set up design tokens" }] },
            ],
        },
        mockData: {},
    },
}
