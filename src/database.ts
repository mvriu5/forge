import { account, dashboard, settings, user, widget } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { drizzle } from 'drizzle-orm/node-postgres'

export const db = drizzle(process.env.DATABASE_URI!)

export type Widget = {
    id: string
    userId: string
    dashboardId: string
    widgetType: string
    height: number
    width: number
    config: Record<string, any>
    positionX: number
    positionY: number
    createdAt: Date
    updatedAt: Date
}

//Widgets
export type WidgetInsert = typeof widget.$inferInsert
type WidgetSelect = typeof widget.$inferSelect

export const createWidget = async (data: WidgetInsert) => {
    return db
        .insert(widget)
        .values(data)
        .returning()
}

export const updateWidget = async (id: string, data: Partial<WidgetInsert>) => {
    const now = new Date()
    return db
        .update(widget)
        .set({...data, updatedAt: now,})
        .where(eq(widget.id, id))
        .returning()
}

export const deleteWidget = async (id: string) => {
    return db
        .delete(widget)
        .where(eq(widget.id, id))
        .returning()
}

export const deleteWidgetsFromDashboard = async (dashboardId: string) => {
    return db
        .delete(widget)
        .where(eq(widget.dashboardId, dashboardId))
}

export const getWidgetsFromUser = async (userId: string): Promise<WidgetSelect[]> => {
    return db
        .select()
        .from(widget)
        .where(eq(widget.userId, userId))
}

export const getWidgetsFromDashboard = async (dashboardId: string): Promise<WidgetSelect[]> => {
    return db
        .select()
        .from(widget)
        .where(eq(widget.dashboardId, dashboardId))
}

export const getWidgetFromId = async (id: string): Promise<WidgetSelect[]> => {
    return db
        .select()
        .from(widget)
        .where(eq(widget.id, id))
}

//Dashboards
export type Dashboard = {
    id: string
    userId: string
    name: string
    createdAt: Date
    updatedAt: Date
}

export type DashboardInsert = typeof dashboard.$inferInsert
type DashboardSelect = typeof dashboard.$inferSelect

export const createDashboard = async (data: DashboardInsert) => {
    return db
        .insert(dashboard)
        .values(data)
        .returning()
}

export const updateDashboard = async (id: string, data: Partial<DashboardInsert>) => {
    const now = new Date()
    return db
        .update(dashboard)
        .set({...data, updatedAt: now,})
        .where(eq(dashboard.id, id))
        .returning()
}

export const deleteDashboard = async (id: string) => {
    return db
        .delete(dashboard)
        .where(eq(dashboard.id, id))
        .returning()
}

export const getDashboardsFromUser = async (userId: string): Promise<DashboardSelect[]> => {
    return db
        .select()
        .from(dashboard)
        .where(eq(dashboard.userId, userId))
}

export const getDashboardFromId = async (id: string): Promise<DashboardSelect[]> => {
    return db
        .select()
        .from(dashboard)
        .where(eq(dashboard.id, id))

}


//Settings
export type Settings = {
    id: string
    userId: string
    lastDashboardId: string | null
    config: Record<string, any>
    onboardingCompleted: boolean
    createdAt: Date
    updatedAt: Date
}

export type SettingsInsert = typeof settings.$inferInsert
type SettingsSelect = typeof settings.$inferSelect

export const createSettings = async (data: SettingsInsert) => {
    return db
        .insert(settings)
        .values(data)
        .returning()
}

export const updateSettings = async (id: string, data: Partial<SettingsInsert>) => {
    const now = new Date()
    return db
        .update(settings)
        .set({...data, updatedAt: now,})
        .where(eq(settings.id, id))
        .returning()
}

export const getSettingsFromUser = async (userId: string): Promise<SettingsSelect[]> => {
    return db
        .select()
        .from(settings)
        .where(eq(settings.userId, userId))
}

export const getSettingsFromId = async (id: string): Promise<SettingsSelect[]> => {
    return db
        .select()
        .from(settings)
        .where(eq(settings.id, id))
}


//Accounts
export type Account = typeof account.$inferSelect
export type AccountInsert = typeof account.$inferInsert

export const getGoogleAccount = async (userId: string): Promise<Account[]> => {
    return db
        .select()
        .from(account)
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, "google")
        ))
}

export const getGithubAccount = async (userId: string): Promise<Account[]> => {
    return db
        .select()
        .from(account)
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, "github")
        ))
}

export const getNotionAccount = async (userId: string): Promise<Account[]> => {
    return db
        .select()
        .from(account)
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, "notion")
        ))
}

export const updateAccount = async (userId: string, provider: string, data: Partial<AccountInsert>) => {
    const now = new Date()
    return db
        .update(account)
        .set({...data, updatedAt: now})
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, provider)
        ))
        .returning()
}

export const deleteAccount = async (userId: string, provider: string) => {
    return db
        .delete(account)
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, provider)
        ))
        .returning()
}

//Users
export type User = typeof user.$inferSelect

export const getUserFromId = async (id: string): Promise<User[]> => {
    return db
        .select()
        .from(user)
        .where(eq(user.id, id))
}

//Notifications
export type Notification = {
    id: string
    userId: string
    type: "reminder" | "alert" | "message"
    message: string
    createdAt: Date
}
