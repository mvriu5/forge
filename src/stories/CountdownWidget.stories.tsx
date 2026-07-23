import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Countdown", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Countdown",
        config: { countdown: { title: "Product launch", emoji: "🚀", date: "2027-01-01T12:00:00.000Z" } },
        mockData: {},
    },
}
