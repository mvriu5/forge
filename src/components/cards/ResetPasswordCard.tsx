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
import {CloudAlert} from "lucide-react"
import {ForgeLogo} from "@/components/svg/ForgeLogo"

function ResetPasswordCard() {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        password: z.string().min(8, {message: "Password must be at least 8 characters."}),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const token = new URLSearchParams(window.location.search).get("token");

        if (!token) {
            router.push("/signin")
            return
        }

        await authClient.resetPassword({
            newPassword: values.password,
            token,
        }, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onSuccess: (ctx) => {
                router.push("/signin")
            },
            onError: (ctx) => {
                addToast({
                    title: "An error occurred",
                    subtitle: ctx.error.message,
                    icon: <CloudAlert size={24}/>
                })
                setLoading(false)
            }
        })

    }

    return (
        <div className={"w-80 h-max rounded-md border border-main/60 bg-primary p-8 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <div className={"flex gap-2 items-center"}>
                    <ForgeLogo/>
                    <p className={"text-lg text-primary font-bold"}>Reset password</p>
                </div>
                <p className={"text-sm text-secondary"}>Type your new password to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New password</FormLabel>
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
                        Reset Password
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { ResetPasswordCard }