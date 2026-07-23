import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const currentHour = new Date()
currentHour.setMinutes(0, 0, 0)
const hourlyWeather = Array.from({ length: 9 }, (_, index) => ({
    time: new Date(currentHour.getTime() + index * 3_600_000).toISOString(),
    temperature: [22.4, 23.1, 24.0, 24.8, 25.2, 24.6, 23.7, 22.9][index],
    weatherCode: [1, 1, 2, 2, 3, 61, 61, 2][index],
}))

const meta = { title: "Widgets/Weather", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Weather",
        config: {},
        mockData: {
            location: { address: { city: "Berlin" } },
            weather: {
                hourly: {
                    time: hourlyWeather.map(({ time }) => time),
                    temperature_2m: hourlyWeather.map(({ temperature }) => temperature),
                    weather_code: hourlyWeather.map(({ weatherCode }) => weatherCode),
                },
            },
        },
    },
}
