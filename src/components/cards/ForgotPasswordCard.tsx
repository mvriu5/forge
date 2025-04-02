"use client"

import {Button, Form, FormField, FormInput, FormItem, FormLabel, FormMessage, useToast} from "lunalabs-ui";
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"
import {authClient} from "@/lib/auth-client"
import {useState} from "react";
import {ButtonSpinner} from "@/components/ButtonSpinner"
import {CloudAlert} from "lucide-react"

function ForgotPasswordCard() {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        email: z.string()
            .email({message: "Please enter a valid email address."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { data, error } = await authClient.forgetPassword({
            email: values.email,
            redirectTo: "/reset"
        }, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onSuccess: (ctx) => {
                setLoading(false)
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
                <p className={"text-lg text-primary font-bold"}>Forgot password</p>
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
                                <FormInput placeholder="E-Mail" className={"focus:ring-brand/40"} {...field} />
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