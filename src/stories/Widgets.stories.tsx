"use client"

import type {Meta, StoryObj} from "@storybook/nextjs-vite"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import React, {useCallback, useMemo, useState} from "react"

import {DashboardGrid} from "@/components/DashboardGrid"
import {Button} from "@/components/ui/Button"
import {TooltipProvider} from "@/components/ui/TooltipProvider"
import type {Widget} from "@/database"
import {IntegrationsProvider, type Integration} from "@/hooks/data/useIntegrations"
import {definitions} from "@/lib/definitions"

type WidgetStoryArgs = {
    widgetType: string
}

const STORYBOOK_USER_ID = ""
const STORYBOOK_DASHBOARD_ID = "storybook-dashboard"

const now = new Date("2026-01-01T00:00:00.000Z")

const integrations: Integration[] = [
    {
        id: "storybook-github",
        accountId: "github",
        userId: STORYBOOK_USER_ID,
        provider: "github",
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiration: null,
        refreshTokenExpiration: null,
        createdAt: now,
    },
    {
        id: "storybook-google",
        accountId: "google",
        userId: STORYBOOK_USER_ID,
        provider: "google",
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiration: null,
        refreshTokenExpiration: null,
        createdAt: now,
    },
]

const createWidget = (widgetType: string): Widget => {
    const definition = definitions.find((item) => item.name === widgetType)
    if (!definition) throw new Error(`Unknown widget story type: ${widgetType}`)

    return {
        id: `storybook-${widgetType.toLowerCase().replaceAll(" ", "-")}`,
        userId: STORYBOOK_USER_ID,
        dashboardId: STORYBOOK_DASHBOARD_ID,
        widgetType,
        width: definition.sizes.desktop.width,
        height: definition.sizes.desktop.height,
        positionX: 0,
        positionY: 0,
        config: (definition.defaultConfig ?? {}) as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
    }
}

const WidgetGridStory = ({widgetType}: WidgetStoryArgs) => {
    const [editMode, setEditMode] = useState(false)
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const [widgets, setWidgets] = useState<Widget[]>(() => [createWidget(widgetType)])

    const queryClient = useMemo(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    refetchOnWindowFocus: false,
                },
            },
        }),
        []
    )

    const integrationValue = useMemo(() => ({
        userId: STORYBOOK_USER_ID,
        integrations,
        isLoading: false,
        handleIntegrate: async () => undefined,
        refetchIntegrations: async () => integrations,
        removeIntegration: async () => undefined,
        removeIntegrationStatus: "idle",
        updateIntegration: async ({provider, userId, data}: {
            provider: string
            userId: string
            data: Partial<Integration>
        }) => ({
            id: `storybook-${provider}`,
            accountId: provider,
            userId,
            provider,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiration: null,
            refreshTokenExpiration: null,
            createdAt: now,
            ...data,
        }),
        updateIntegrationStatus: "idle",
    }), [])

    const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
        setWidgets((currentWidgets) => currentWidgets.map((widget) => (
            widget.id === id
                ? {...widget, positionX: x, positionY: y, updatedAt: new Date()}
                : widget
        )))
    }, [])

    const handleWidgetUpdate = useCallback(async (updatedWidget: Widget) => {
        setWidgets((currentWidgets) => currentWidgets.map((widget) => (
            widget.id === updatedWidget.id ? updatedWidget : widget
        )))
        return updatedWidget
    }, [])

    const handleWidgetDelete = useCallback((id: string) => {
        setWidgets((currentWidgets) => currentWidgets.filter((widget) => widget.id !== id))
        setActiveWidget((widget) => widget?.id === id ? null : widget)
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <IntegrationsProvider value={integrationValue}>
                <TooltipProvider>
                    <div className="min-h-screen bg-primary p-6 text-primary">
                        <div className="mb-4 flex items-center gap-3">
                            <Button
                                variant={editMode ? "brand" : "default"}
                                onClick={() => setEditMode((enabled) => !enabled)}
                            >
                                {editMode ? "Edit mode aus" : "Edit mode an"}
                            </Button>
                        </div>
                        <div className="mx-auto max-w-5xl rounded-md border border-main/60 bg-secondary">
                            <DashboardGrid
                                editMode={editMode}
                                activeWidgetId={activeWidget?.id ?? null}
                                currentDashboardId={STORYBOOK_DASHBOARD_ID}
                                widgets={widgets}
                                activeWidget={activeWidget}
                                setActiveWidget={setActiveWidget}
                                updateWidgetPosition={updateWidgetPosition}
                                onWidgetDelete={handleWidgetDelete}
                                onWidgetUpdate={handleWidgetUpdate}
                                isFullscreen={false}
                            />
                        </div>
                    </div>
                </TooltipProvider>
            </IntegrationsProvider>
        </QueryClientProvider>
    )
}

const meta = {
    title: "Widgets/Grid",
    component: WidgetGridStory,
    parameters: {
        layout: "fullscreen",
    },
} satisfies Meta<typeof WidgetGridStory>

export default meta

type Story = StoryObj<typeof meta>

export const Bookmark: Story = {
    args: {
        widgetType: "Bookmark",
    },
}

export const Clock: Story = {
    args: {
        widgetType: "Clock",
    },
}

export const Countdown: Story = {
    args: {
        widgetType: "Countdown",
    },
}

export const Crypto: Story = {
    args: {
        widgetType: "Crypto",
    },
}

export const Editor: Story = {
    args: {
        widgetType: "Editor",
    },
}

export const Frame: Story = {
    args: {
        widgetType: "Frame",
    },
}

export const GithubHeatmap: Story = {
    args: {
        widgetType: "Github Heatmap",
    },
}

export const Github: Story = {
    args: {
        widgetType: "Github",
    },
}

export const Inbox: Story = {
    args: {
        widgetType: "Inbox",
    },
}

export const Kanban: Story = {
    args: {
        widgetType: "Kanban",
    },
}

export const Meetings: Story = {
    args: {
        widgetType: "Meetings",
    },
}

export const Todo: Story = {
    args: {
        widgetType: "Todo",
    },
}

export const Weather: Story = {
    args: {
        widgetType: "Weather",
    },
}
