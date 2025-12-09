"use client"

import type {WidgetDefinition, WidgetPreview} from "@forge/sdk"

import {bookmarkWidgetDefinition} from "@/components/widgets/BookmarkWidget"
import {clockWidgetDefinition} from "@/components/widgets/ClockWidget"
import {countdownWidgetDefinition} from "@/components/widgets/CountdownWidget"
import {editorWidgetDefinition} from "@/components/widgets/EditorWidget"
import {githubheatmapWidgetDefinition} from "@/components/widgets/GithubHeatmapWidget"
import {githubWidgetDefinition} from "@/components/widgets/GithubWidget"
import {kanbanWidgetDefinition} from "@/components/widgets/KanbanWidget"

export const widgetRegistry: WidgetDefinition[] = [
    bookmarkWidgetDefinition,
    clockWidgetDefinition,
    countdownWidgetDefinition,
    editorWidgetDefinition,
    githubheatmapWidgetDefinition,
    githubWidgetDefinition,
    kanbanWidgetDefinition
]

export const getWidgetDefinition = (name: string): WidgetDefinition => {
    const def = widgetRegistry.find((w) => w.name === name)
    if (!def) throw new Error(`Unknown widget type: ${name}`)
    return def
}

export const getWidgetPreview = (name: string): WidgetPreview => {
    const def = widgetRegistry.find((w) => w.preview.title === name)
    if (!def) throw new Error(`Unknown widget type: ${name}`)
    return def.preview
}

export const getAllWidgetPreviews = () => widgetRegistry.map((w) => w.preview)