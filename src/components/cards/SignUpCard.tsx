"use client"

import { Form, FormField, FormItem, FormLabel, FormInput, FormMessage } from "@/components/ui/Form"
import { useToast } from "@/components/ui/ToastProvider"
import {Button} from "@/components/ui/Button"
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {CloudAlert, Github} from "lucide-react"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {ForgeLogo} from "@/components/svg/ForgeLogo"

function SignUpCard() {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        name: z.string().min(3, {message: "Name must be at least 3 characters."}),
        email: z.string().email({message: "Please enter a valid email address."}),
        password: z.string().min(8, {message: "Password must be at least 8 characters."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name: values.name,
            callbackURL: "/dashboard"
        }, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onSuccess: (ctx) => {
                router.push("/signin")
            },
            onError: (ctx) => {
                setLoading(false)
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
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
                    <p className={"text-lg text-primary font-bold"}>Sign Up</p>
                </div>
                <p className={"text-sm text-secondary"}>Create an account to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormInput placeholder="Name" {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                        Sign up
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
                        <p className={"text-tertiary text-sm"}>Already have an account?</p>
                        <Button
                            type={"button"}
                            variant="ghost"
                            onClick={() => router.replace("/signin")}
                            className={"bg-transparent hover:bg-transparent hover:text-primary font-mono font-normal w-max hover:underline text-sm px-0"}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export { SignUpCard }