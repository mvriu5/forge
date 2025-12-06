"use client"

import { Form, FormField, FormItem, FormLabel, FormInput, FormMessage } from "@/components/ui/Form"
import {Button} from "@/components/ui/Button"
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link"
import {Spinner} from "@/components/ui/Spinner"
import {Github, Google} from "@/components/svg/Icons"
import {toast} from "sonner"
import {useAuth} from "@/hooks/useAuth"
import {useIntegrations} from "@/hooks/data/useIntegrations"
import {useSession} from "@/hooks/data/useSession"

function SignUpCard() {
    const {userId} = useSession()
    const {signupSchema, isLoading, handleEmailSignUp} = useAuth()
    const {handleIntegrate} = useIntegrations(userId)

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    return (
        <div className={"w-80 h-max rounded-md border border-main/40 bg-linear-to-br from-primary from-30% to-tertiary shadow-[0_10px_10px_rgba(0,0,0,0.2)] p-8 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <div className={"flex gap-2 items-center"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <p className={"text-lg text-primary font-bold"}>Sign Up</p>
                </div>
                <p className={"text-sm text-secondary"}>Create an account to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailSignUp)} className={"w-full flex flex-col"}>
                    <div className={"w-full flex flex-col gap-4"}>
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
                    </div>
                    <div className={"w-full flex flex-col gap-2 mt-4"}>
                        <Button
                            type="submit"
                            variant={"brand"}
                            className={"w-full"}
                            disabled={isLoading}
                        >
                            {isLoading && <Spinner/>}
                            Sign up
                        </Button>
                        <div className={"w-full flex gap-2"}>
                            <Button
                                type={"button"}
                                className={"w-full"}
                                variant={"default"}
                                onClick={() => handleIntegrate(("github"))}
                            >
                                <Github width={18} height={18}/>
                            </Button>
                            <Button
                                type={"button"}
                                className={"group w-full"}
                                variant={"default"}
                                onClick={() => handleIntegrate("google")}
                            >
                                <Google width={18} height={18}/>
                            </Button>
                        </div>
                    </div>
                    <div className={"w-full flex items-center gap-2 -mb-8 mt-8 bg-tertiary border border-main/20 shadow-md rounded-t-lg px-2"}>
                        <p className={"text-tertiary text-sm"}>Already have an account?</p>
                        <Link href={"/signin"}>
                            <Button
                                type={"button"}
                                variant="ghost"
                                className={"bg-transparent hover:bg-transparent hover:text-primary font-mono font-normal w-max hover:underline text-sm px-0"}
                            >
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export { SignUpCard }