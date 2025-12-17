"use client"

import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Button} from "@/components/ui/Button"
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import Link from "next/link"
import {Spinner} from "@/components/ui/Spinner"
import {useAuth} from "@/hooks/useAuth"

function ResetPasswordCard() {
    const {resetSchema, isLoading, handlePasswordReset} = useAuth()

    const form = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: ""
        }
    })

    return (
        <div className={"w-80 h-max rounded-md border border-main/30 bg-linear-to-br from-primary from-30% to-tertiary shadow-[0_10px_10px_rgba(0,0,0,0.2)] p-8 flex flex-col gap-8 z-50"}>
            <div className={"flex flex-col gap-2"}>
                <div className={"flex gap-2 items-center"}>
                    <Link href={"/"} className={"cursor-default"}>
                        <ForgeLogo/>
                    </Link>
                    <p className={"text-lg text-primary font-bold"}>Reset password</p>
                </div>
                <p className={"text-sm text-secondary"}>Type your new password to continue.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-4">
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
                        variant={"brand"}
                        className={"w-full"}
                        disabled={isLoading}
                    >
                        {isLoading && <Spinner/>}
                        Reset Password
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export { ResetPasswordCard }