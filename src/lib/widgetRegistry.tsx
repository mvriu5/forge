"use client"

import React from "react"
import dynamic from "next/dynamic"

export interface WidgetPreview {
    widgetType: string
    previewImage: string
    title: string
    description: string
    tags: string[]
    sizes: {
        desktop: {width: number, height: number},
        tablet: {width: number, height: number},
        mobile: {width: number, height: number}
    }
}

export interface WidgetElement {
    preview: WidgetPreview
    component: React.ComponentType<any>
}

const dynamicWidget = (loader: () => Promise<React.ComponentType<any>>) =>
    dynamic(loader, { ssr: false })

export const widgetRegistry: WidgetElement[] = [
    {
        preview: {
            widgetType: "editor",
            previewImage: '/editor_preview.svg',
            title: 'Editor',
            description: 'A simple text editor widget',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/EditorWidget")).EditorWidget),
    },
    {
        preview: {
            widgetType: "github",
            previewImage: '/github_preview.svg',
            title: 'Github',
            description: 'See your open github issues & pull requests',
            tags: ["github"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/GithubWidget")).GithubWidget),
    },
    {
        preview: {
            widgetType: "weather",
            previewImage: '/github_preview.svg',
            title: 'Weather',
            description: 'See the weather in your location',
            tags: ["weather"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/WeatherWidget")).WeatherWidget),
    },
    {
        preview: {
            widgetType: "bookmark",
            previewImage: '/bookmark_preview.svg',
            title: 'Bookmark',
            description: 'Store your bookmarks',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/BookmarkWidget")).BookmarkWidget)
    },
    {
        preview: {
            widgetType: "phantom",
            previewImage: '/github_preview.svg',
            title: 'Phantom Wallet',
            description: 'See your phantom wallet balance',
            tags: ["finance"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/PhantomWidget")).PhantomWidget),
    },
    {
        preview: {
            widgetType: "meetings",
            previewImage: '/meetings_preview.png',
            title: 'Upcoming Meetings',
            description: 'Overview of your next meetings',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2},
                tablet: { width: 1, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/MeetingsWidget")).MeetingsWidget),
    },
    {
        preview: {
            widgetType: "github-heatmap",
            previewImage: '/github_preview.svg',
            title: 'Github Heatmap',
            description: 'Overview of your next meetings',
            tags: ["productivity", "github"],
            sizes: {
                desktop: { width: 2, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/GithubHeatmapWidget")).GithubHeatmapWidget),
    },
    {
        preview: {
            widgetType: "clock",
            previewImage: '/github_preview.svg',
            title: 'Clock',
            description: 'Beautiful clock to display your current time',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/ClockWidget")).ClockWidget),
    },
    {
        preview: {
            widgetType: "todo",
            previewImage: '/github_preview.svg',
            title: 'Todo List',
            description: 'All your tasks in one place',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/TodoWidget")).TodoWidget),
    },
    {
        preview: {
            widgetType: "kanban",
            previewImage: '/github_preview.svg',
            title: 'Kanban Board',
            description: 'Organize your tasks in a kanban board',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 2, height: 2 },
                tablet: { width: 2, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/KanbanWidget")).KanbanWidget),
    },
    /*{
        preview: {
            widgetType: "calendar",
            previewImage: '/github_preview.svg',
            title: 'Calendar',
            description: 'See your calendar events',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 3, height: 3 },
                tablet: { width: 2, height: 2 },
                mobile: { width: 1, height: 2 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/CalendarWidget")).CalendarWidget),
    },*/
    {
        preview: {
            widgetType: "countdown",
            previewImage: '/github_preview.svg',
            title: 'Countdown',
            description: 'See how much time is left to a special event',
            tags: [],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 2 }
            }
        },
        component: dynamicWidget(async () => (await import("@/components/widgets/CountdownWidget")).CountdownWidget),
    }
]

export const getWidgetComponent = (name: string) => {
    const WidgetComponent = widgetRegistry.find((widget) => widget.preview.widgetType === name)!.component
    return (props: any) => <WidgetComponent {...props} name={name} />
}

export const getWidgetPreview = (name: string) => {
    return widgetRegistry.find((widget) => widget.preview.widgetType === name)!;
}

export const getAllWidgetPreviews = () => {
    return widgetRegistry.map((widget) => widget.preview)
}
