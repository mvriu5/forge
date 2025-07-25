import {betterAuth} from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {db} from "@/database"
import {schema} from "@/db/schema"
import {Resend} from 'resend'
import {VerificationEmail} from "@/components/emails/VerificationEmail"
import {ReactNode} from "react"
import {ResetPasswordEmail} from "@/components/emails/ResetPasswordEmail"
import {genericOAuth} from "better-auth/plugins"
import {nextCookies} from "better-auth/next-js"

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    trustedOrigins: ["http://localhost:3000", "https://tryforge.io"],
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
            scope: ["repo"],
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            scope: ["https://www.googleapis.com/auth/calendar"],
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "consent"
        },
    },
    session: {
        expiresIn: 604800, // 7 days
        updateAge: 86400, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 300 // 5 minutes
        }
    },
    advanced: {
        useSecureCookies: true,
        defaultCookieAttributes: {
            httpOnly: true,
            secure: true
        }
    },
    plugins: [
        nextCookies(),
        genericOAuth({
            config: [
                {
                    providerId: "linear",
                    clientId: process.env.LINEAR_CLIENT_ID as string,
                    clientSecret: process.env.LINEAR_CLIENT_SECRET as string,
                    authorizationUrl: "https://linear.app/oauth/authorize",
                    tokenUrl:      "https://api.linear.app/oauth/token",
                    scopes:        ["read"],
                    getUserInfo: async (tokens) => {
                        const { accessToken, idToken, refreshToken } = tokens

                        const res = await fetch("https://api.linear.app/graphql", {
                            method: "POST",
                            headers: {
                                "Content-Type":  "application/json",
                                "Authorization": `Bearer ${accessToken}`
                            },
                            body: JSON.stringify({ query: "{ viewer { id name email avatarUrl } }" })
                        })
                        const { data } = await res.json()
                        if (!data?.viewer) return null

                        const now = new Date()
                        return {
                            id:            String(data.viewer.id),
                            name:          String(data.viewer.name),
                            email:         String(data.viewer.email),
                            emailVerified: true,
                            createdAt:     now,
                            updatedAt:     now,
                            image:         data.viewer.avatarUrl ?? null
                        }
                    }
                }
            ]
        })
    ]
})

export type Session = typeof auth.$Infer.Session
