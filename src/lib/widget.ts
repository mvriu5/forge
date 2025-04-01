"use client"

import type React from "react"
import {EditorWidget} from "@/components/widgets/EditorWidget"
import {GithubWidget} from "@/components/widgets/GithubWidget"

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
    component: React.FC
}


export const widgetRegistry: WidgetElement[] = [
    {
        preview: {
            widgetType: "EditorWidget",
            height: 2,
            width: 2,
            previewImage: '/sample.jpg',
            title: 'Editor',
            description: 'A simple text editor widget',
            tags: ["notes"]
        },
        component: EditorWidget
    },
    {
        preview: {
            widgetType: "GithubWidget",
            height: 2,
            width: 2,
            previewImage: '/sample.jpg',
            title: 'Github',
            description: 'See your open github issues & pull requests',
            tags: ["github"]
        },
        component: GithubWidget
    }
]


export const getWidgetComponent = (name: string) => {
    return widgetRegistry.find((widget) => widget.preview.widgetType === name)?.component
}

export const getWidgetPreview = (name: string) => {
    return widgetRegistry.find((widget) => widget.preview.widgetType === name)?.preview
}

export const getAllWidgetPreviews = () => {
    return widgetRegistry.map((widget) => widget.preview)
}
