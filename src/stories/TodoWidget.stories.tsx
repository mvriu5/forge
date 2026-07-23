import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Todo", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Todo",
        config: {
            todos: [
                { id: "todo-1", checked: false, text: "Review dashboard widgets", createdAt: "2026-01-20T09:00:00.000Z" },
                { id: "todo-2", checked: true, text: "Prepare Storybook mocks", createdAt: "2026-01-19T11:00:00.000Z" },
            ],
        },
        mockData: {},
    },
}
