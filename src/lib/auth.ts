import {betterAuth} from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {db} from "@/database"
import {schema} from "@/db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    /*
    emailVerification: {
        sendVerificationEmail: async ( { user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address",
                text: `Click the link to verify your email: ${url}`,
            });
        },
    },
    */
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    }
})

export type Session = typeof auth.$Infer.Session
