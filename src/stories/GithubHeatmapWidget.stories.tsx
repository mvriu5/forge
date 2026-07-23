import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const endDate = new Date()
endDate.setUTCHours(12, 0, 0, 0)
endDate.setUTCDate(endDate.getUTCDate() - ((endDate.getUTCDay() + 1) % 7))
const contributions = Array.from({ length: 371 }, (_, index) => {
    const date = new Date(endDate)
    date.setUTCDate(endDate.getUTCDate() - (370 - index))
    return { date: date.toISOString().slice(0, 10), count: index % 11 === 0 ? 0 : (index * 7) % 13 }
})

const meta = { title: "Widgets/Github Heatmap", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Github Heatmap",
        config: {},
        mockData: { contributions },
    },
}
