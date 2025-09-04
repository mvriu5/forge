"use client"

import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {ArrowLeft, CloudAlert, Mailbox} from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormInput, FormMessage } from "@/components/ui/Form";
import { useToast } from "@/components/ui/ToastProvider";
import {Button} from "@/components/ui/Button"
import {ForgeLogo} from "@forge/ui/components/svg/ForgeLogo"
import Link from "next/link";
import {Spinner} from "@/components/ui/Spinner"

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
        <div className={"w-80 h-max rounded-md border border-main/30 bg-linear-to-br from-primary from-30% to-tertiary shadow-[0_10px_10px_rgba(0,0,0,0.2)] p-8 pt-4 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <Button
                    type={"button"}
                    variant="ghost"
                    onClick={() => router.replace("/signin")}
                    className={"bg-transparent text-tertiary hover:bg-transparent hover:text-secondary font-mono font-normal w-max text-sm px-0 gap-2"}
                >
                    <ArrowLeft size={16} />
                    Go back
                </Button>
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
                        variant={"brand"}
                        className={"w-full"}
                        disabled={loading}
                    >
                        {loading && <Spinner/>}
                        Send email
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { ForgotPasswordCard }