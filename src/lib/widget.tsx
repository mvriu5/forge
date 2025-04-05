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
            widgetType: "editor",
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
            widgetType: "github",
            height: 2,
            width: 1,
            previewImage: '/sample.jpg',
            title: 'Github',
            description: 'See your open github issues & pull requests',
            tags: ["github"]
        },
        component: GithubWidget
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
