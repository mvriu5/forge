"use client"

import {Button, Form, FormField, FormInput, FormItem, FormLabel, FormMessage } from "lunalabs-ui";
import { z } from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"

function SignInCard({onSignUp, onForgotPassword}: {onSignUp: () => void, onForgotPassword: () => void}) {
    const router = useRouter()

    const formSchema = z.object({
        email: z.string()
            .email({message: "Please enter a valid email address."}),
        password: z.string()
            .min(6, {message: "Password must be at least 6 characters."}),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { data, error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/"
        }, {
            onRequest: (ctx) => {
                //show loading
            },
            onSuccess: (ctx) => {
                router.push("/")
            },
            onError: (ctx) => {
                alert(ctx.error.message)
            }
        })
    }

    return (
        <div className={"w-80 h-max rounded-md border border-main/60 bg-primary p-8 flex flex-col gap-8"}>
            <div className={"flex flex-col gap-2"}>
                <p className={"text-lg text-primary font-bold"}>Sign Up</p>
                <p className={"text-sm text-secondary"}>Create an account to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-Mail</FormLabel>
                                <FormInput placeholder="E-Mail" {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormInput placeholder="Password" type={"password"} {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className={"bg-brand hover:bg-brand/90 text-primary w-full"}
                    >
                        Sign in
                    </Button>
                    <div className={"flex items-center gap-2"}>
                        <p className={"text-tertiary text-sm"}>Don't have an account yet?</p>
                        <Button
                            type={"button"}
                            variant="ghost"
                            onClick={onSignUp}
                            className={"bg-transparent hover:bg-transparent hover:text-primary font-normal w-max hover:underline text-sm px-0"}
                        >
                            Sign Up
                        </Button>
                    </div>
                    <Button
                        type={"button"}
                        variant="ghost"
                        onClick={onForgotPassword}
                        className={"bg-transparent hover:bg-transparent hover:text-primary font-normal w-max hover:underline text-sm px-0"}
                    >
                        Forgot Password
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { SignInCard }