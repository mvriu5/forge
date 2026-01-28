import { toast } from "@/components/ui/Toast"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

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

    const handleEmailSignUp = async (values: z.infer<typeof signupSchema>) => {
        await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name: values.name,
            callbackURL: "/dashboard",
        }, {
            onRequest: () => {
                setIsLoading(true)
            },
            onSuccess: () => {
                setIsLoading(false)
                toast.success("We sent you an email! Verify your email to continue.")
            },
            onError: () => {
                setIsLoading(false)
                toast.error("Something went wrong.")
            },
        })
    }

    const handleEmailSignIn = async (values: z.infer<typeof signinSchema>) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/dashboard"
        }, {
            onRequest: () => {
                setIsLoading(true)
            },
            onSuccess: () => {
                setIsLoading(false)
            },
            onError: (ctx) => {
                if (ctx.error.status === 403) {
                    toast.error("Verify your email first!")
                } else if (ctx.error.status === 401) {
                    toast.error("Wrong credentials.")
                } else {
                    toast.error("Something went wrong.")
                }
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

    return {
        isLoading,
        signupSchema,
        signinSchema,
        handleEmailSignUp,
        handleEmailSignIn,
        handleSignOut
    }
}
