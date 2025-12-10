"use client"

import type {WidgetDefinition, WidgetPreview} from "@forge/sdk"

import {bookmarkWidgetDefinition} from "@/components/widgets/BookmarkWidget"
import {clockWidgetDefinition} from "@/components/widgets/ClockWidget"
import {countdownWidgetDefinition} from "@/components/widgets/CountdownWidget"
import {editorWidgetDefinition} from "@/components/widgets/EditorWidget"
import {githubheatmapWidgetDefinition} from "@/components/widgets/GithubHeatmapWidget"
import {githubWidgetDefinition} from "@/components/widgets/GithubWidget"
import {kanbanWidgetDefinition} from "@/components/widgets/KanbanWidget"
import {meetingsWidgetDefinition} from "@/components/widgets/MeetingsWidget"
import {phantomWidgetDefinition} from "@/components/widgets/PhantomWidget"
import {todoWidgetDefinition} from "@/components/widgets/TodoWidget"
import {weatherWidgetDefinition} from "@/components/widgets/WeatherWidget"

export const widgetRegistry: WidgetDefinition[] = [
    bookmarkWidgetDefinition,
    clockWidgetDefinition,
    countdownWidgetDefinition,
    editorWidgetDefinition,
    githubheatmapWidgetDefinition,
    githubWidgetDefinition,
    kanbanWidgetDefinition,
    meetingsWidgetDefinition,
    phantomWidgetDefinition,
    todoWidgetDefinition,
    weatherWidgetDefinition
] as const satisfies WidgetDefinition[]

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