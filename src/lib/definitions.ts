"use client"

import React, { type ComponentType } from "react"

export type TypedIntegration = "github" | "google" | "linear" | "atlassian" | string

export interface BaseWidget {
    id: string
    userId: string
    dashboardId: string
    widgetType: string
    height: number
    width: number
    config: Record<string, unknown>
    positionX: number
    positionY: number
    createdAt: Date
    updatedAt: Date
}

export interface WidgetSizes {
    desktop: { width: number; height: number }
    tablet: { width: number; height: number }
    mobile: { width: number; height: number }
}

export interface WidgetRuntimeProps<W extends BaseWidget = BaseWidget, Config = any> {
    widget: W
    editMode: boolean
    isDragging?: boolean
    previewPosition?: { x: number; y: number } | null
    isSwapPreview?: boolean
    onWidgetUpdate?: (widget: W) => Promise<BaseWidget>
    onWidgetDelete?: (id: string) => void
    config?: Config
    updateConfig?: (updater: Config | ((prev: Config) => Config)) => Promise<void>
}

export interface WidgetPropsBase<W extends BaseWidget = BaseWidget> {
    widget: W
    updateWidget?: (updater: W | ((prev: W) => W)) => Promise<void>
    editMode: boolean
    integration?: TypedIntegration
    isDragging?: boolean
    onWidgetDelete?: (id: string) => void
}

export interface WidgetPropsWithConfig<Config, W extends BaseWidget = BaseWidget> extends WidgetPropsBase<W> {
    config: Config
    updateConfig: (updater: Config | ((prev: Config) => Config)) => Promise<void>
}

export type WidgetProps<Config = undefined, W extends BaseWidget = BaseWidget> =
    [Config] extends [undefined]
        ? WidgetPropsBase<W>
        : WidgetPropsWithConfig<Config, W>

export interface WidgetDefinition<Config = any, W extends BaseWidget = BaseWidget> {
    name: string
    Component: ComponentType<WidgetRuntimeProps<W, Config>>
    description: string
    image: string
    tags: string[]
    sizes: WidgetSizes
    defaultConfig?: Config
    integration?: TypedIntegration
}

type WidgetDefinitionModule = Record<string, unknown>
type WidgetDefinitionLoader = () => Promise<WidgetDefinitionModule>

const pickDefinition = async (loader: WidgetDefinitionLoader): Promise<{ default: ComponentType<WidgetRuntimeProps> }> => {
    const module = await loader()
    const definition = Object.values(module).find((value): value is WidgetDefinition => {
        return Boolean(value && typeof value === "object" && "Component" in value)
    })

    if (!definition) throw new Error("Widget module did not export a widget definition")

    return { default: definition.Component as ComponentType<WidgetRuntimeProps> }
}

const createLazyWidgetDefinition = <Config = any>({
    loader,
    ...definition
}: Omit<WidgetDefinition<Config>, "Component"> & { loader: WidgetDefinitionLoader }): WidgetDefinition<Config> => ({
    ...definition,
    Component: React.lazy(() => pickDefinition(loader)),
})

export const definitions: WidgetDefinition[] = [
    createLazyWidgetDefinition({
        name: "Bookmark",
        description: "Store your bookmarks",
        image: "/bookmark_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 1 },
        },
        defaultConfig: { bookmarks: [] },
        loader: () => import("@/components/widgets/BookmarkWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Clock",
        description: "Beautiful clock to display your current time",
        image: "/clock_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 },
        },
        loader: () => import("@/components/widgets/ClockWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Countdown",
        description: "See how much time is left to a special event",
        image: "/countdown_preview.svg",
        tags: [],
        sizes: {
            desktop: { width: 1, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 2 },
        },
        defaultConfig: { countdown: null },
        loader: () => import("@/components/widgets/CountdownWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Crypto",
        description: "Track live crypto spot prices",
        image: "/crypto_preview.svg",
        tags: ["crypto", "finance"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        defaultConfig: { timeframe: "24h", products: ["BTC-USD", "ETH-USD", "SOL-USD"] },
        loader: () => import("@/components/widgets/CryptoWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Editor",
        description: "A simple text editor widget",
        image: "/editor_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        defaultConfig: { notes: [] },
        loader: () => import("@/components/widgets/EditorWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Frame",
        description: "Embed content from any website using an iframe.",
        image: "/frame_preview.svg",
        tags: [],
        sizes: {
            desktop: { width: 2, height: 2 },
            tablet: { width: 2, height: 2 },
            mobile: { width: 1, height: 1 },
        },
        defaultConfig: { url: "" },
        loader: () => import("@/components/widgets/FrameWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Github Heatmap",
        integration: "github",
        description: "Show off your commit streak.",
        image: "/githubheatmap_preview.svg",
        tags: ["github"],
        sizes: {
            desktop: { width: 2, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 },
        },
        loader: () => import("@/components/widgets/GithubHeatmapWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Github",
        integration: "github",
        description: "See your open github issues & pull requests.",
        image: "/github_preview.svg",
        tags: ["github"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        loader: () => import("@/components/widgets/GithubWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Inbox",
        integration: "google",
        description: "See your received google mails.",
        image: "/inbox_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        loader: () => import("@/components/widgets/InboxWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Kanban",
        description: "Organize your tasks in a kanban board",
        image: "/kanban_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 2, height: 2 },
            tablet: { width: 2, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        defaultConfig: { columns: [] },
        loader: () => import("@/components/widgets/KanbanWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Meetings",
        integration: "google",
        description: "Overview of your next meetings",
        image: "/meetings_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 2 },
        },
        loader: () => import("@/components/widgets/MeetingsWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Todo",
        description: "All your tasks in one place",
        image: "/todo_preview.svg",
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 2 },
            mobile: { width: 1, height: 1 },
        },
        defaultConfig: { todos: [] },
        loader: () => import("@/components/widgets/TodoWidget"),
    }),
    createLazyWidgetDefinition({
        name: "Weather",
        description: "See the weather in your location",
        image: "/weather_preview.svg",
        tags: ["weather"],
        sizes: {
            desktop: { width: 1, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 },
        },
        loader: () => import("@/components/widgets/WeatherWidget"),
    }),
]

const definitionsByName = new Map(definitions.map((definition) => [definition.name, definition]))

export const getWidgetDefinition = (name: string): WidgetDefinition => {
    const def = definitionsByName.get(name)
    if (!def) throw new Error(`Unknown widget type: ${name}`)
    return def
}
