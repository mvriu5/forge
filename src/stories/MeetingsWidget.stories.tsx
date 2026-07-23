import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meetingDate = (hoursFromNow: number, durationMinutes: number) => {
    const start = new Date(Date.now() + hoursFromNow * 3_600_000)
    return { start: { dateTime: start.toISOString() }, end: { dateTime: new Date(start.getTime() + durationMinutes * 60_000).toISOString() } }
}

const meta = { title: "Widgets/Meetings", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Meetings",
        config: {},
        mockData: {
            calendars: [{ id: "primary", summary: "Work", primary: true, backgroundColor: "#6366f1" }],
            events: [
                {
                    id: "event-1",
                    calendarId: "primary",
                    summary: "Product sync",
                    ...meetingDate(2, 45),
                    attendees: [{ email: "anna@example.com", displayName: "Anna" }],
                    hangoutLink: "https://meet.google.com/mock-call",
                },
                { id: "event-2", calendarId: "primary", summary: "Design critique", ...meetingDate(26, 60), attendees: [] },
            ],
        },
    },
}
