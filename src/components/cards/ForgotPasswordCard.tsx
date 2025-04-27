"use client"

import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {CloudAlert, Mailbox} from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormInput, FormMessage } from "@/components/ui/Form";
import { useToast } from "@/components/ui/ToastProvider";
import {Button} from "@/components/ui/Button"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link";

function ForgotPasswordCard() {
    const {addToast} = useToast()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        email: z.string().email({message: "Please enter a valid email address."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await authClient.forgetPassword({email: values.email, redirectTo: "/reset"}, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onSuccess: (ctx) => {
                addToast({
                    title: "Reset E-Mail was sent.",
                    subtitle: "Please check your mails.",
                    icon: <Mailbox size={24} className={"text-brand"}/>
                })
                setLoading(false)
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24} className={"text-error"}/>
                })
                setLoading(false)
            }
        })
    }

    return (
        <div className={"w-80 h-max rounded-md border border-main/60 bg-primary shadow-xl p-8 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <div className={"flex gap-2 items-center"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <p className={"text-lg text-primary font-bold"}>Forgot password</p>
                </div>
                <p className={"text-sm text-secondary"}>Submit your email to continue.</p>
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
                    <Button
                        type="submit"
                        className={"bg-brand hover:bg-brand/90 text-primary w-full"}
                    >
                        {loading && <ButtonSpinner/>}
                        Send email
                    </Button>
                    <Button
                        type={"button"}
                        variant="ghost"
                        onClick={() => router.replace("/signin")}
                        className={"w-full"}
                    >
                        Go back
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { ForgotPasswordCard }