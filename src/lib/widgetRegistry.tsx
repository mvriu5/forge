"use client"

import type React from "react"
import {EditorWidget} from "@/components/widgets/EditorWidget"
import {GithubWidget} from "@/components/widgets/GithubWidget"
import {WeatherWidget} from "@/components/widgets/WeatherWidget"
import {StockWidget} from "@/components/widgets/StockWidget"
import {BookmarkWidget} from "@/components/widgets/BookmarkWidget"
import {LinearWidget} from "@/components/widgets/LinearWidget"
import {PhantomWidget} from "@/components/widgets/PhantomWidget"
import {MeetingsWidget} from "@/components/widgets/MeetingsWidget"
import {GithubHeatmapWidget} from "@/components/widgets/GithubHeatmapWidget"
import {ClockWidget} from "@/components/widgets/ClockWidget"
import {TodoWidget} from "@/components/widgets/TodoWidget"

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
    component: React.FC<any>
}


export const widgetRegistry: WidgetElement[] = [
    {
        preview: {
            widgetType: "editor",
            previewImage: '/editor_preview.svg',
            title: 'Editor',
            description: 'A simple text editor widget',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 2, height: 2 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: EditorWidget,
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
        component: GithubWidget,
    },
    {
        preview: {
            widgetType: "stock",
            previewImage: '/stock_preview.png',
            title: 'Stock Overview',
            description: 'Track your stock data',
            tags: ["finance"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: StockWidget,
    },
    {
        preview: {
            widgetType: "weather",
            previewImage: '/weather_preview.png',
            title: 'Weather',
            description: 'See the weather in your location',
            tags: ["weather"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: WeatherWidget
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
        component: BookmarkWidget
    },
    {
        preview: {
            widgetType: "linear",
            previewImage: '/linear_preview.png',
            title: 'Linear Tasks',
            description: 'See all your assigned linear tasks',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: LinearWidget
    },
    {
        preview: {
            widgetType: "phantom",
            previewImage: '/phantom_preview.png',
            title: 'Phantom Wallet',
            description: 'See your phantom wallet balance',
            tags: ["finance"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: PhantomWidget
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
        component: MeetingsWidget
    },
    {
        preview: {
            widgetType: "github-heatmap",
            previewImage: '/github_heatmap_preview.png',
            title: 'Github Heatmap',
            description: 'Overview of your next meetings',
            tags: ["productivity", "github"],
            sizes: {
                desktop: { width: 2, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: GithubHeatmapWidget
    },
    {
        preview: {
            widgetType: "clock",
            previewImage: '/clock_preview.png',
            title: 'Clock',
            description: 'Beautiful clock to display your current time',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 1 },
                tablet: { width: 1, height: 1 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: ClockWidget
    },
    {
        preview: {
            widgetType: "todo",
            previewImage: '/todo_preview.png',
            title: 'Todo List',
            description: 'All your tasks in one place',
            tags: ["productivity"],
            sizes: {
                desktop: { width: 1, height: 2 },
                tablet: { width: 1, height: 2 },
                mobile: { width: 1, height: 1 }
            }
        },
        component: TodoWidget
    }
]


export const getWidgetComponent = (name: string) => {
    const WidgetComponent = widgetRegistry.find((widget) => widget.preview.widgetType === name)?.component
    if (!WidgetComponent) return null
    return (props: any) => <WidgetComponent {...props} name={name} />
}


export const getWidgetPreview = (name: string) => {
    return widgetRegistry.find((widget) => widget.preview.widgetType === name);
}

export const getAllWidgetPreviews = () => {
    return widgetRegistry.map((widget) => widget.preview)
}
