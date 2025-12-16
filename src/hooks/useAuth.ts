import {useState} from "react"
import {z} from "zod"
import {authClient} from "@/lib/auth-client"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {auth} from "@/lib/auth"
import {refreshAccessToken} from "better-auth"

export const useAuth = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const signupSchema = z.object({
        name: z.string().min(3, {message: "Name must be at least 3 characters."}),
        email: z.email({message: "Please enter a valid email address."}),
        password: z.string().min(8, {message: "Password must be at least 8 characters."})
    })

    const signinSchema = z.object({
        email: z.email({message: "Please enter a valid email address."}),
        password: z.string()
    })

    const forgotSchema = z.object({
        email: z.email({message: "Please enter a valid email address."})
    })

    const resetSchema = z.object({
        password: z.string().min(8, {message: "Password must be at least 8 characters."}),
    })

    const handleEmailSignUp = async (values: z.infer<typeof signupSchema>) => {
        await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name: values.name,
            callbackURL: "/dashboard",
        }, {
            onRequest: (ctx) => {
                setIsLoading(true)
            },
            onSuccess: (ctx) => {
                setIsLoading(false)
                toast.success("We sent you an email!", {
                    description: "Verify your email to continue.",
                    duration: 1000 * 60 * 5 // 5 minutes
                })
            },
            onError: (ctx) => {
                setIsLoading(false)
                toast.error("Something went wrong", {description: ctx.error.message})
            },
        })
    }

    const handleEmailSignIn = async (values: z.infer<typeof signinSchema>) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/dashboard"
        }, {
            onRequest: (ctx) => {
                setIsLoading(true)
            },
            onSuccess: (ctx) => {
                setIsLoading(false)
            },
            onError: (ctx) => {
                if (ctx.error.status === 403) {
                    toast.error("Verify your email first!")
                } else if (ctx.error.status === 401) {
                    toast.error("Wrong credentials")
                } else {
                    toast.error("Something went wrong", {description: ctx.error.message})
                }
                setIsLoading(false)
            }
        })
    }

    const handlePasswordForgot = async (values: z.infer<typeof forgotSchema>) => {
        await authClient.requestPasswordReset({
            email: values.email,
            redirectTo: "/reset"
        }, {
            onRequest: (ctx) => {
                setIsLoading(true)
            },
            onSuccess: (ctx) => {
                toast.success("Reset E-Mail was sent.", {description: "Please check your mails."})
                setIsLoading(false)
            },
            onError: (ctx) => {
                toast.error("Something went wrong", {description: ctx.error.message})
                setIsLoading(false)
            }
        })
    }

    const handlePasswordReset = async (values: z.infer<typeof resetSchema>) => {
        const token = new URLSearchParams(window.location.search).get("token")

        if (!token) {
            router.push("/signin")
            return
        }

        await authClient.resetPassword({
            newPassword: values.password,
            token,
        }, {
            onRequest: (ctx) => {
                setIsLoading(true)
            },
            onSuccess: (ctx) => {
                router.push("/signin")
            },
            onError: (ctx) => {
                toast.error("Something went wrong", {description: ctx.error.message})
                setIsLoading(false)
            }
        })
    }

    const handleSignOut = async () => {
        setIsLoading(true)

        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.push("/")
            }
        })

        router.push("/")
    }

    const getGoogleAccessToken = async (userId: string) => {
        const ctx = await auth.$context
        const [account] = await ctx.internalAdapter.findAccountByUserId(userId)
        if (account.refreshToken && account.accessTokenExpiresAt && account.accessTokenExpiresAt.getTime() - Date.now() < 5_000) {
            try {
                const res = await refreshAccessToken({
                    refreshToken: account.refreshToken,
                    tokenEndpoint: "https://oauth2.googleapis.com/token",
                    options: {
                        clientId: process.env.GOOGLE_CLIENT_ID!,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
                    }
                })
                await ctx.internalAdapter.updateAccount(account.id, {
                    accessToken: res.accessToken,
                    accessTokenExpiresAt: res.accessTokenExpiresAt,
                    refreshToken: res.refreshToken,
                    refreshTokenExpiresAt: res.refreshTokenExpiresAt
                })
                console.log("Refreshed access token.")
                return res.accessToken
            } catch (e: any) {
                console.error("Failed to refres access token:", e)
                return null
            }
        }
        return account.accessToken
    }

    return {
        isLoading,
        signupSchema,
        signinSchema,
        forgotSchema,
        resetSchema,
        handleEmailSignUp,
        handleEmailSignIn,
        handlePasswordForgot,
        handlePasswordReset,
        handleSignOut,
        getGoogleAccessToken
    }
}