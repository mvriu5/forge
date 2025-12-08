"use client"

import type { WidgetDefinition, WidgetPreview } from "@forge/sdk"

import { bookmarkWidgetDefinition } from "@/components/widgets/BookmarkWidget"

export const widgetRegistry: WidgetDefinition[] = [
    bookmarkWidgetDefinition,
]

export const getWidgetDefinition = (type: string): WidgetDefinition => {
    const def = widgetRegistry.find((w) => w.type === type)
    if (!def) throw new Error(`Unknown widget type: ${type}`)
    return def
}

export const getWidgetPreview = (type: string): WidgetPreview => {
    const def = widgetRegistry.find((w) => w.preview.widgetType === type)
    if (!def) throw new Error(`Unknown widget type: ${type}`)
    return def.preview
}

export const getAllWidgetPreviews = () => widgetRegistry.map((w) => w.preview)