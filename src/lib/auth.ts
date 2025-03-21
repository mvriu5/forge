import { betterAuth } from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import { db } from "@/database"
import {accounts, sessions, users, verification } from "@/db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: users,
            account: accounts,
            session: sessions,
            verification: verification
        }
    }),
    emailVerification: {
        sendVerificationEmail: async ( { user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address",
                text: `Click the link to verify your email: ${url}`,
            });
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    },
    advanced: {
        useSecureCookies: true
    }
})