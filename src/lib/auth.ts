import { betterAuth } from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import { db } from "@/database"
import { schema } from "@/db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.users,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
})