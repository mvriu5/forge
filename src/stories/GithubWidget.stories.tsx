import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WidgetStory, widgetStoryArgTypes } from "./WidgetStoryHarness"

const meta = { title: "Widgets/Github", component: WidgetStory, parameters: { layout: "fullscreen" }, argTypes: widgetStoryArgTypes } satisfies Meta<
    typeof WidgetStory
>
export default meta
export const Default: StoryObj<typeof meta> = {
    args: {
        widgetType: "Github",
        config: {},
        mockData: {
            issues: [
                {
                    id: 1,
                    number: 42,
                    title: "Improve widget keyboard navigation",
                    html_url: "https://github.com/mvriu5/forge/issues/42",
                    repository_url: "https://api.github.com/repos/mvriu5/forge",
                    labels: [{ name: "accessibility", color: "7c3aed" }],
                    created_at: "2026-01-20T09:00:00Z",
                },
                {
                    id: 2,
                    number: 51,
                    title: "Add dashboard templates",
                    html_url: "https://github.com/mvriu5/forge/issues/51",
                    repository_url: "https://api.github.com/repos/mvriu5/forge",
                    labels: [{ name: "feature", color: "2563eb" }],
                    created_at: "2026-02-03T14:30:00Z",
                },
            ],
            pullRequests: [
                {
                    id: 3,
                    number: 58,
                    title: "Refine responsive grid",
                    html_url: "https://github.com/mvriu5/forge/pull/58",
                    repository_url: "https://api.github.com/repos/mvriu5/forge",
                    labels: [{ name: "ui", color: "db2777" }],
                    created_at: "2026-02-12T11:15:00Z",
                    pull_request: {},
                },
            ],
        },
    },
}
