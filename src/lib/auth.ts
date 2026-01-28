import { db } from "@/database"
import { schema } from "@/db/schema"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"

const isProd = process.env.NODE_ENV === "production"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google", "notion"]
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false
    },
    socialProviders: {
        github: {
            scope: ["repo", "user:email"],
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`
        },
        google: {
            scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/gmail.readonly"],
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "select_account consent",
            redirectUri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        },
        notion: {
            clientId: process.env.NOTION_CLIENT_ID as string,
            clientSecret: process.env.NOTION_CLIENT_SECRET as string,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/notion`,
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        },
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24 * 3, // 1 day (every 1 day the session expiration is updated)
    },
    advanced: {
        useSecureCookies: isProd,
        defaultCookieAttributes: {
            secure: isProd
        }
    }
})
