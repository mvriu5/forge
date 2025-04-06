import { drizzle } from 'drizzle-orm/node-postgres'
import {account, widget} from "@/db/schema"
import {and, eq} from "drizzle-orm"

export const db = drizzle(process.env.DATABASE_URI!)

export type Widget = {
    id: string
    userId: string
    widgetType: string
    height: number
    width: number
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

export const getWidgetsFromUser = async (userId: string): Promise<WidgetSelect[]> => {
    return db
        .select()
        .from(widget)
        .where(eq(widget.userId, userId))
}

//Accounts
export type Account = typeof account.$inferSelect

export const getGithubAccount = async (userId: string): Promise<Account[]> => {
    return db
        .select()
        .from(account)
        .where(and(
            eq(account.userId, userId),
            eq(account.providerId, "github")
        ))
}