"use client"

import { Form, FormField, FormItem, FormLabel, FormInput, FormMessage } from "@/components/ui/Form";
import { useToast } from "@/components/ui/ToastProvider";
import {Button} from "@/components/ui/Button"
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {CloudAlert, Github} from "lucide-react";
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {ForgeLogo} from "@/components/svg/ForgeLogo"

function SignInCard() {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        email: z.string().email({message: "Please enter a valid email address."}),
        password: z.string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/dashboard"
        }, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onError: (ctx) => {
                if (ctx.error.status === 403) {
                    addToast({
                        title: "Verify your email first!",
                        icon: <CloudAlert size={24}/>
                    })
                } else {
                    addToast({
                        title: "An error occurred",
                        subtitle: ctx.error.message,
                        icon: <CloudAlert size={24}/>
                    })
                }
                setLoading(false)
            }
        })
    }

    const onGithubSignin = async () => {
        await authClient.signIn.social({provider: "github", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
            }
        })
    }

    const onGoogleSignin = async () => {
        await authClient.signIn.social({provider: "google", callbackURL: "/dashboard"}, {
            onRequest: (ctx) => {
            },
            onSuccess: (ctx) => {
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
            }
        })
    }

    return (
        <div className={"w-80 h-max rounded-md border border-main/60 bg-primary p-8 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <div className={"flex gap-2 items-center"}>
                    <ForgeLogo/>
                    <p className={"text-lg text-primary font-bold"}>Sign In</p>
                </div>
                <p className={"text-sm text-secondary"}>Log into your account to continue.</p>
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
                        {loading && <ButtonSpinner/>}
                        Sign in
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            type={"button"}
                            className={"w-full"}
                            variant={"default"}
                            onClick={onGithubSignin}
                        >
                            <Github size={18}/>
                        </Button>
                        <Button
                            type={"button"}
                            className={"group w-full"}
                            variant={"default"}
                            onClick={onGoogleSignin}
                        >
                            <GoogleIcon className={"group-hover:fill-primary"}/>
                        </Button>
                    </div>
                    <div className={"flex items-center gap-2"}>
                        <p className={"text-tertiary text-sm"}>Don't have an account yet?</p>
                        <Button
                            type={"button"}
                            variant="ghost"
                            onClick={() => router.replace("/signup")}
                            className={"bg-transparent hover:bg-transparent hover:text-primary font-mono font-normal w-max hover:underline text-sm px-0"}
                        >
                            Sign Up
                        </Button>
                    </div>
                    <Button
                        type={"button"}
                        variant="ghost"
                        onClick={() => router.replace("/forgot")}
                        className={"bg-transparent hover:bg-transparent hover:text-secondary font-mono text-tertiary font-normal w-max hover:underline text-xs px-0"}
                    >
                        Forgot Password
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { SignInCard }