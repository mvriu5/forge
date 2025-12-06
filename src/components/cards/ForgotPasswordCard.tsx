"use client"

import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {ArrowLeft} from "lucide-react"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form";
import {Button} from "@/components/ui/Button"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link";
import {Spinner} from "@/components/ui/Spinner"
import {useAuth} from "@/hooks/useAuth"

function ForgotPasswordCard() {
    const {forgotSchema, isLoading, handlePasswordForgot} = useAuth()

    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            email: ""
        }
    })

    return (
        <div className={"w-80 h-max rounded-md border border-main/30 bg-linear-to-br from-primary from-30% to-tertiary shadow-[0_10px_10px_rgba(0,0,0,0.2)] p-8 pt-4 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <Link href="/signin">
                    <Button
                        type={"button"}
                        variant="ghost"
                        className={"bg-transparent text-tertiary hover:bg-transparent hover:text-secondary font-mono font-normal w-max text-sm px-0 gap-2"}
                    >
                        <ArrowLeft size={16} />
                        Go back
                    </Button>
                </Link>
                <div className={"flex gap-2 items-center"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <p className={"text-lg text-primary font-bold"}>Forgot password</p>
                </div>
                <p className={"text-sm text-secondary"}>Submit your email to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePasswordForgot)} className="space-y-4">
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
                        disabled={isLoading}
                    >
                        {isLoading && <Spinner/>}
                        Send email
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { ForgotPasswordCard }