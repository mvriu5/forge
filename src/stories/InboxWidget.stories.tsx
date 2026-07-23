import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const headers = (from: string, subject: string, date: string) => ({
    headers: [
        { name: "From", value: from },
        { name: "Subject", value: subject },
        { name: "Date", value: date },
    ],
})

const meta = { title: "Widgets/Inbox", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Inbox",
        config: {},
        mockData: {
            labels: [
                { id: "INBOX", name: "Inbox" },
                { id: "STARRED", name: "Starred" },
            ],
            messages: [
                {
                    id: "mail-1",
                    threadId: "thread-1",
                    internalDate: "1769943600000",
                    snippet: "The latest Forge release is ready.",
                    payload: headers("Forge Team <team@forge.dev>", "Release ready", "Sun, 1 Feb 2026 10:00:00 +0100"),
                },
                {
                    id: "mail-2",
                    threadId: "thread-2",
                    internalDate: "1769857200000",
                    snippet: "Can we review the new dashboard today?",
                    payload: headers("Anna <anna@example.com>", "Dashboard review", "Sat, 31 Jan 2026 10:00:00 +0100"),
                },
            ],
        },
    },
}
