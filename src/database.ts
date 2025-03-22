import { drizzle } from 'drizzle-orm/node-postgres'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const db = drizzle(process.env.DATABASE_URI!)