import {betterAuth} from "better-auth/minimal"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {db} from "@/database"
import {schema} from "@/db/schema"
import {Resend} from 'resend'
import {VerificationEmail} from "@/components/emails/VerificationEmail"
import {ReactNode} from "react"
import {ResetPasswordEmail} from "@/components/emails/ResetPasswordEmail"
import {OAuth2Tokens, refreshAccessToken} from "better-auth"

const resend = new Resend(process.env.RESEND_API_KEY)
const isProd = process.env.NODE_ENV === "production"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    trustedOrigins: ["http://localhost:3000", "https://tryforge.io", "https://www.tryforge.io"],
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"]
        }
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: "hello@tryforge.io",
                to: [user.email],
                subject: "Welcome to forge!",
                react: VerificationEmail({url}) as ReactNode
            })
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: true,
        sendResetPassword: async ({user, url}) => {
            await resend.emails.send({
                from: "hello@tryforge.io",
                to: [user.email],
                subject: "Reset your password",
                react: ResetPasswordEmail({url}) as ReactNode
            })
        }
    },
    socialProviders: {
        github: {
            scope: ["repo", "user:email"],
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`
        },
        google: {
            scope: ["https://www.googleapis.com/auth/calendar"],
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "select_account consent",
            redirectUri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        }
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

export type Session = typeof auth.$Infer.Session
