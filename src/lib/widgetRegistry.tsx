"use client"

import type React from "react"
import {EditorWidget} from "@/components/widgets/EditorWidget"
import {GithubWidget} from "@/components/widgets/GithubWidget"
import {StockSmallWidget} from "@/components/widgets/StockSmallWidget"
import {WeatherWidget} from "@/components/widgets/WeatherWidget"
import {StockMediumWidget} from "@/components/widgets/StockMediumWidget"
import {BookmarkWidget} from "@/components/widgets/BookmarkWidget"

export interface WidgetPreview {
    widgetType: string
    height: number
    width: number
    previewImage: string
    title: string
    description: string
    tags: string[]
}

export interface WidgetElement {
    preview: WidgetPreview
    component: React.FC<any>
}


export const widgetRegistry: WidgetElement[] = [
    {
        preview: {
            widgetType: "editor",
            height: 2,
            width: 2,
            previewImage: '/editor_preview.png',
            title: 'Editor',
            description: 'A simple text editor widget',
            tags: ["productivity"]
        },
        component: EditorWidget,
    },
    {
        preview: {
            widgetType: "github",
            height: 2,
            width: 1,
            previewImage: '/github_preview.png',
            title: 'Github',
            description: 'See your open github issues & pull requests',
            tags: ["github"]
        },
        component: GithubWidget,
    },
    {
        preview: {
            widgetType: "stockSmall",
            height: 1,
            width: 1,
            previewImage: '/stocksmall_preview.png',
            title: 'Stock',
            description: 'Track your stock data',
            tags: ["stock"]
        },
        component: StockSmallWidget,
    },
    {
        preview: {
            widgetType: "stockMedium",
            height: 2,
            width: 1,
            previewImage: '/stockmedium_preview.png',
            title: 'Stock Overview',
            description: 'Track your stock data',
            tags: ["stock"]
        },
        component: StockMediumWidget,
    },
    {
        preview: {
            widgetType: "weather",
            height: 1,
            width: 1,
            previewImage: '/weather_preview.png',
            title: 'Weather',
            description: 'See the weather in your location',
            tags: ["weather"]
        },
        component: WeatherWidget
    },
    {
        preview: {
            widgetType: "bookmark",
            height: 2,
            width: 1,
            previewImage: '/bookmark_preview.png',
            title: 'Bookmark',
            description: 'Store your bookmarks',
            tags: ["productivity"]
        },
        component: BookmarkWidget
    }

]


export const getWidgetComponent = (name: string) => {
    const WidgetComponent = widgetRegistry.find((widget) => widget.preview.widgetType === name)?.component

    if (!WidgetComponent) return null

    return (props: any) => <WidgetComponent {...props} name={name} />
}

export const getWidgetPreview = (name: string) => {
    return widgetRegistry.find((widget) => widget.preview.widgetType === name)?.preview
}

export const getAllWidgetPreviews = () => {
    return widgetRegistry.map((widget) => widget.preview)
}
