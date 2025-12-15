"use client"

import {useSession} from "@/hooks/data/useSession"
import React, {useRef, useState} from "react"
import type {PutBlobResult} from "@vercel/blob"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {authClient} from "@/lib/auth-client"
import {toast} from "sonner"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Button} from "@/components/ui/Button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {CircleUserRound, X} from "lucide-react"
import {Input} from "@/components/ui/Input"
import {Spinner} from "@/components/ui/Spinner"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {useSettings} from "@/hooks/data/useSettings"
import {formatDate} from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(3, {message: "Please enter more than 3 characters."})
})

function ProfileSection({handleClose}: {handleClose: () => void}) {
    const {userId, session, updateUser} = useSession()
    const {settings} = useSettings(userId)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image ?? "")
    const [blob, setBlob] = useState<PutBlobResult | undefined>(undefined)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user?.name,
        }
    })

    const removeAvatarTooltip = useTooltip({
        message: "Remove your current avatar",
        anchor: "tc"
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const file = inputFileRef.current?.files ? inputFileRef.current.files[0] : null
            let imageUrl = session?.user?.image || null

            if (file) {
                const uploadedBlob = await handleUpload()
                imageUrl = uploadedBlob?.url || imageUrl
            }

            await authClient.updateUser({
                image: imageUrl,
                name: values.name
            })

            updateUser({ image: imageUrl, name: values.name })
            toast.success("Successfully updated your profile")
            handleClose()
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    const handleUpload = async () => {
        try {
            const file = inputFileRef.current!.files![0]
            setUploading(true)

            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: inputFileRef.current!.files![0]
            })

            const data = (await response.json()) as PutBlobResult
            setBlob(data)
            return data

        } catch (error) {
            toast.error("Something went wrong")
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setBlob(undefined)
            setAvatarUrl(undefined)
            inputFileRef.current!.value = ""

            const filename = session?.user?.image
            if (!filename) return

            await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                method: "DELETE"
            })

            await authClient.updateUser({image: null})
            updateUser({ image: null })
            handleClose()
            toast.success("Successfully removed your avatar")
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className={"flex flex-col gap-4 h-full justify-between"}>
            <div className={"flex flex-col gap-4 h-full"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
                        <div className="w-full flex gap-4 bg-secondary border border-main/40 p-2 rounded-md">
                            <div className="relative w-min inline-flex">
                                <Button
                                    type={"button"}
                                    className="relative size-14 p-0 overflow-hidden shadow-none rounded-full"
                                    onClick={() => inputFileRef.current?.click()}
                                    aria-label={avatarUrl ? "Change image" : "Upload image"}
                                >
                                    {avatarUrl ? (
                                        <Avatar className={"size-14"}>
                                            <AvatarImage
                                                src={blob?.url || avatarUrl || undefined}
                                                alt="Avatar Preview"
                                                className="object-cover"
                                            />
                                            <AvatarFallback/>
                                        </Avatar>
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="flex h-full w-full items-center justify-center"
                                        >
                                            <CircleUserRound className="size-6 opacity-60" />
                                        </div>
                                    )}
                                </Button>

                                {avatarUrl && (
                                    <Button
                                        className="absolute -top-1 -right-1 p-0 size-6 rounded-full bg-tertiary text-secondary hover:bg-primary hover:text-primary border border-main/40"
                                        onClick={handleDelete}
                                        aria-label="Remove image"
                                        type={"button"}
                                        {...removeAvatarTooltip}
                                    >
                                        <X className="h-3.5 w-3.5" strokeWidth={2.5}/>
                                    </Button>
                                )}

                                <Input
                                    id="picture"
                                    type="file"
                                    accept="image/*"
                                    ref={inputFileRef}
                                    onChange={() => setAvatarUrl(URL.createObjectURL(inputFileRef.current!.files![0]))}
                                    className="hidden"
                                />
                                <FormLabel
                                    htmlFor="picture"
                                    className="hidden"
                                />
                            </div>
                            <div className={"w-full flex flex-col gap-2"}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className={"w-full"}>
                                            <FormLabel>Name</FormLabel>
                                            <FormInput placeholder="Name" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className={"w-full flex gap-2 text-sm mt-2"}>
                                    <p className={"text-tertiary"}>E-Mail:</p>
                                    <p className={""}>{session?.user?.email}</p>
                                </div>
                                <div className={"w-full flex gap-2 text-sm"}>
                                    <p className={"text-tertiary"}>Account created:</p>
                                    <p className={""}>{formatDate(session?.user?.createdAt, settings?.config?.hourFormat)}</p>
                                </div>
                            </div>
                        </div>
                        <div className={"w-full flex gap-2 justify-end"}>
                            <Button
                                className={"w-max"}
                                type={"button"}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"brand"}
                                className={"w-max"}
                                type={"submit"}
                                disabled={form.formState.isSubmitting || uploading}
                            >
                                {(form.formState.isSubmitting || uploading) && <Spinner/>}
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export {ProfileSection}
