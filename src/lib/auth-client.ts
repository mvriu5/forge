import {createAuthClient} from "better-auth/react"
import {genericOAuthClient} from "better-auth/client/plugins"
import {nextCookies} from "better-auth/next-js"

export const authClient = createAuthClient({
    plugins: [
        nextCookies(),
        genericOAuthClient(),
    ]
})


