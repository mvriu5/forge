import {boolean, integer, jsonb, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core"

export const user = pgTable("users", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
})

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at')
})

export const widget = pgTable("widget", {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    dashboardId: uuid('dashboard_id').notNull().references(()=> dashboard.id, { onDelete: 'cascade' }),
    widgetType: text('widget_type').notNull(),
    height: integer('height').notNull(),
    width: integer('width').notNull(),
    config: jsonb('config'),
    positionX: integer('position_x').notNull(),
    positionY: integer('position_y').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const dashboard = pgTable("dashboard", {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    isPublic: boolean('is_public').notNull().default(false),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const settings = pgTable("settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    lastDashboardId: uuid('last_dashboard_id').references(()=> dashboard.id, { onDelete: 'cascade' }),
    config: jsonb('config'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const schema = { user, session, account, verification, widget, dashboard, settings }