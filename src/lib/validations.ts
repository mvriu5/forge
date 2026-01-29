import { z } from "zod"

export const fileUploadSchema = z.object({
    filename: z.string().min(1, { message: "Filename is required" }),
})

export const createSettingsSchema = z.object({
    config: z.record(z.string(), z.any()),
})

export const updateSettingsSchema = z.object({
    id: z.string(),
    lastDashboardId: z.string().optional(),
    config: z.record(z.string(), z.any()).optional(),
    onboardingCompleted: z.boolean().optional(),
})

export const createDashboardSchema = z.object({
    name: z.string().min(1, { message: "Dashboard name is required" }),
})

export const updateDashboardSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: "Dashboard name is required" }),
})

export const getDashboardSchema = z.object({
    id: z.string().optional(),
})

export const deleteDashboardSchema = z.object({
    id: z.string(),
})

export const widgetTypeEnum = z.enum([
    "Bookmark",
    "Clock",
    "Countdown",
    "Crypto",
    "Editor",
    "Github Heatmap",
    "Github",
    "Inbox",
    "Kanban",
    "Meetings",
    "Todo",
    "Weather",
])

export const createWidgetSchema = z.object({
    dashboardId: z.string(),
    widgetType: widgetTypeEnum,
    height: z.number(),
    width: z.number(),
    positionX: z.number(),
    positionY: z.number(),
})

export const updateWidgetSchema = z.object({
    id: z.string(),
    height: z.number().optional(),
    width: z.number().optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    config: z.record(z.string(), z.any()).optional(),
})

export const getWidgetsSchema = z.object({
    dashboardId: z.string().optional(),
})

export const deleteWidgetSchema = z.object({
    id: z.string(),
})

export const providerEnum = z.enum(["google", "github", "notion"])

export const deleteAccountSchema = z.object({
    provider: providerEnum,
})

export const updateAccountSchema = z.object({
    provider: providerEnum,
    refreshToken: z.string(),
})

export const notificationTypeEnum = z.enum(["message", "alert", "reminder"])

export const createNotificationSchema = z.object({
    type: notificationTypeEnum,
    message: z.string(),
})

export const getUserSchema = z.object({
    id: z.string().optional(),
})

export const coinbaseTimeframeEnum = z.enum(["1h", "24h", "1w", "1m", "3m", "6m", "1y"])

export const getCoinbasePricesSchema = z.object({
    products: z.string().optional(),
    timeframe: coinbaseTimeframeEnum.optional(),
})

export const getNotionPageSchema = z.object({
    pageId: z.string(),
})
