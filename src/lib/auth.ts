import {betterAuth} from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {db} from "@/database"
import {schema} from "@/db/schema"
import { Resend } from 'resend'
import {VerificationEmail} from "@/components/emails/VerificationEmail"
import {ReactNode} from "react"
import {ResetPasswordEmail} from "@/components/emails/ResetPasswordEmail"

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"]
        }
    },
    emailVerification: {
        sendVerificationEmail: async ( { user, url, token }, request) => {
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
        sendResetPassword: async ({user, url, token}, request) => {
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
            scope: ["repo"],
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            scope: ["https://www.googleapis.com/auth/calendar.events.readonly"],
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    }
})

export type Session = typeof auth.$Infer.Session
