"use client"

import type {WidgetDefinition} from "@tryforgeio/sdk"

import {bookmarkWidgetDefinition} from "@/components/widgets/BookmarkWidget"
import {clockWidgetDefinition} from "@/components/widgets/ClockWidget"
import {countdownWidgetDefinition} from "@/components/widgets/CountdownWidget"
import {editorWidgetDefinition} from "@/components/widgets/EditorWidget"
import {githubheatmapWidgetDefinition} from "@/components/widgets/GithubHeatmapWidget"
import {githubWidgetDefinition} from "@/components/widgets/GithubWidget"
import {kanbanWidgetDefinition} from "@/components/widgets/KanbanWidget"
import {meetingsWidgetDefinition} from "@/components/widgets/MeetingsWidget"
import {todoWidgetDefinition} from "@/components/widgets/TodoWidget"
import {weatherWidgetDefinition} from "@/components/widgets/WeatherWidget"
import { inboxWidgetDefinition } from "@/components/widgets/InboxWidget"

export const definitions: WidgetDefinition[] = [
    bookmarkWidgetDefinition,
    clockWidgetDefinition,
    countdownWidgetDefinition,
    editorWidgetDefinition,
    githubheatmapWidgetDefinition,
    githubWidgetDefinition,
    kanbanWidgetDefinition,
    meetingsWidgetDefinition,
    todoWidgetDefinition,
    weatherWidgetDefinition,
    inboxWidgetDefinition
] as const satisfies WidgetDefinition[]

export const getWidgetDefinition = (name: string): WidgetDefinition => {
    const def = definitions.find((w) => w.name === name)
    if (!def) throw new Error(`Unknown widget type: ${name}`)
    return def
}
