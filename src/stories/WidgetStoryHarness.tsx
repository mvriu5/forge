"use client"

import { RealtimeContext } from "@upstash/realtime/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import { DashboardGrid } from "@/components/DashboardGrid"
import { Button } from "@/components/ui/Button"
import { TooltipProvider } from "@/components/ui/TooltipProvider"
import type { Widget } from "@/database"
import { IntegrationsProvider, type Integration } from "@/hooks/data/useIntegrations"
import { definitions } from "@/lib/definitions"

export type StoryMockData = Record<string, unknown>
export type WidgetStoryArgs = {
    widgetType: string
    config: Record<string, unknown>
    mockData: StoryMockData
}

const USER_ID = "storybook-user"
const DASHBOARD_ID = "storybook-dashboard"
const WEATHER_COORDS = { lat: 52.52, lon: 13.405 }
const now = new Date("2026-01-01T10:00:00.000Z")

const integrations: Integration[] = ["github", "google", "notion"].map((provider) => ({
    id: `storybook-${provider}`,
    accountId: provider,
    userId: USER_ID,
    provider,
    connected: true,
    accessTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
    createdAt: now,
}))

const createWidget = (widgetType: string, config: Record<string, unknown>): Widget => {
    const definition = definitions.find((item) => item.name === widgetType)
    if (!definition) throw new Error(`Unknown widget story type: ${widgetType}`)
    return {
        id: `storybook-${widgetType.toLowerCase().replaceAll(" ", "-")}`,
        userId: USER_ID,
        dashboardId: DASHBOARD_ID,
        widgetType,
        width: definition.sizes.desktop.width,
        height: definition.sizes.desktop.height,
        positionX: 0,
        positionY: 0,
        config,
        createdAt: now,
        updatedAt: now,
    }
}

const seedMockQueries = (client: QueryClient, data: StoryMockData) => {
    client.setQueryData(["settings", USER_ID], {
        id: "storybook-settings",
        userId: USER_ID,
        lastDashboardId: DASHBOARD_ID,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
        config: {
            theme: "system",
            hourFormat: "24",
            timezone: "Europe/Berlin",
            todoReminder: false,
            countdownReminder: false,
            githubReminder: false,
            meetingReminders: [],
            deleteTodos: false,
            ...((data.settings ?? {}) as Record<string, unknown>),
        },
    })
    client.setQueryData(["coinbase-currencies"], data.currencies ?? [])
    client.setQueryData(["coinbase-prices", data.products ?? [], data.timeframe ?? "24h"], data.prices ?? [])
    client.setQueryData(["githubIssues", "github"], { allIssues: data.issues ?? [], allPullRequests: data.pullRequests ?? [] })
    client.setQueryData(["githubHeatmap", "github", undefined], data.contributions ?? [])
    client.setQueryData(["notionPages", USER_ID], data.pages ?? [])
    client.setQueryData(["gmailLabels", "google"], data.labels ?? [])
    const gmailData = { pages: [{ messages: data.messages ?? [] }], pageParams: [undefined] }
    client.setQueryData(["gmailMessages", "google", []], gmailData)
    client.setQueryData(["gmailMessages", "google", ["INBOX"]], gmailData)
    const calendars = (data.calendars ?? []) as Array<{ id: string }>
    client.setQueryData(["googleCalendarList", "google"], calendars)
    client.setQueryData(["googleCalendarEvents", "google", []], data.events ?? [])
    client.setQueryData(["googleCalendarEvents", "google", calendars.map(({ id }) => id)], data.events ?? [])
    client.setQueryData(["reverse-geocoding", WEATHER_COORDS], data.location ?? {})
    client.setQueryData(["weather", WEATHER_COORDS], data.weather ?? null)
}

export const widgetStoryArgTypes = {
    widgetType: { table: { disable: true } },
    config: { control: "object" as const, description: "Direkt im Widget gespeicherte Inhalte und Einstellungen" },
    mockData: { control: "object" as const, description: "Gemockte API- und Integrationsdaten" },
}

export const WidgetStory = ({ widgetType, config, mockData }: WidgetStoryArgs) => {
    const [editMode, setEditMode] = useState(false)
    const [theme, setTheme] = useState<"dark" | "light">("dark")
    const [widget, setWidget] = useState(() => createWidget(widgetType, config))
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null)
    const queryClient = useMemo(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY, refetchOnWindowFocus: false } },
            }),
        []
    )

    useEffect(() => {
        localStorage.setItem("weatherWidgetCoords", JSON.stringify(WEATHER_COORDS))
        seedMockQueries(queryClient, mockData)
        setWidget(createWidget(widgetType, config))
        setActiveWidget(null)
    }, [config, mockData, queryClient, widgetType])

    const integrationValue = useMemo(
        () => ({
            userId: USER_ID,
            integrations,
            isLoading: false,
            handleIntegrate: async () => undefined,
            refetchIntegrations: async () => integrations,
            removeIntegration: async () => undefined,
            removeIntegrationStatus: "idle" as const,
        }),
        []
    )

    const handleWidgetUpdate = useCallback(async (updatedWidget: Widget) => {
        setWidget(updatedWidget)
        return updatedWidget
    }, [])
    const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
        setWidget((current) => (current.id === id ? { ...current, positionX: x, positionY: y, updatedAt: new Date() } : current))
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <IntegrationsProvider value={integrationValue}>
                <RealtimeContext.Provider value={{ status: "disconnected", register: () => undefined, unregister: () => undefined }}>
                    <TooltipProvider>
                        <div className={theme === "dark" ? "dark" : ""}>
                            <div className="min-h-screen bg-primary p-6 text-primary">
                                <div className="mx-auto w-full max-w-[1600px]">
                                    <div className="mb-4 flex items-center gap-3">
                                        <Button variant={editMode ? "brand" : "default"} onClick={() => setEditMode((value) => !value)}>
                                            {editMode ? "Edit mode aus" : "Edit mode an"}
                                        </Button>
                                        <Button onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}>
                                            {theme === "dark" ? "Light mode" : "Dark mode"}
                                        </Button>
                                    </div>
                                    <div className="overflow-hidden rounded-md border border-main/40 bg-secondary">
                                        <DashboardGrid
                                            key={`${widgetType}-${JSON.stringify(config)}`}
                                            editMode={editMode}
                                            activeWidgetId={activeWidget?.id ?? null}
                                            currentDashboardId={DASHBOARD_ID}
                                            widgets={[widget]}
                                            activeWidget={activeWidget}
                                            setActiveWidget={setActiveWidget}
                                            updateWidgetPosition={updateWidgetPosition}
                                            onWidgetDelete={() => undefined}
                                            onWidgetUpdate={handleWidgetUpdate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TooltipProvider>
                </RealtimeContext.Provider>
            </IntegrationsProvider>
        </QueryClientProvider>
    )
}
