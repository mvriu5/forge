"use client"

import type React from "react"
import {useRef, useState} from "react"
import {Blocks, CloudAlert, Github, ImageIcon, Settings, Trash, UserRoundCheck} from "lucide-react"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {useSessionStore} from "@/store/sessionStore"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {useIntegrationStore} from "@/store/integrationStore"
import {cn} from "@/lib/utils"
import {authClient} from "@/lib/auth-client"
import type {PutBlobResult} from "@vercel/blob"
import {ButtonSpinner} from "@/components/ButtonSpinner"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/ToastProvider"
import { Form, FormLabel, FormField, FormItem, FormInput, FormMessage } from "@/components/ui/Form"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar"
import {Input} from "@/components/ui/Input"

function SettingsDialog() {
    const {addToast} = useToast()
    const {session} = useSessionStore()
    const {addIntegration, removeIntegration, githubIntegration, googleIntegration} = useIntegrationStore()
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("profile")

    const integrationList = [
        {
            name: "github",
            icon: Github,
            active: !!githubIntegration,
            onConnect: async () => {
                const data = await authClient.signIn.social({provider: "github"}, {
                    onRequest: (ctx) => {
                    },
                    onSuccess: (ctx) => {
                        setOpen(false)
                        addToast({
                            title: "Successfully integrated Github",
                            icon: <Blocks size={24}/>
                        })
                        if (session?.user) addIntegration(session.user.id)
                    },
                    onError: (ctx) => {
                        addToast({
                            title: "An error occurred",
                            subtitle: ctx.error.message,
                            icon: <CloudAlert size={24}/>
                        })
                    }
                })
            },
            onDisconnect: () => removeIntegration("github")
        },
        {
            name: "google",
            icon: GoogleIcon,
            active: !!googleIntegration,
            onConnect: async () => {
                const data = await authClient.signIn.social({provider: "google"}, {
                    onRequest: (ctx) => {
                    },
                    onSuccess: (ctx) => {
                        setOpen(false)
                        addToast({
                            title: "Successfully integrated Google",
                            icon: <Blocks size={24}/>
                        })
                        if (session?.user) addIntegration(session.user.id)
                    },
                    onError: (ctx) => {
                        addToast({
                            title: "An error occurred",
                            subtitle: ctx.error.message,
                            icon: <CloudAlert size={24}/>
                        })
                    }
                })
            },
            onDisconnect: () => removeIntegration("google")
        }
    ]

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                setOpen(!open)
                setTab("profile")
            }}
        >
            <DialogTrigger asChild>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary"}
                >
                    <Settings size={16} className={"text-tertiary"}/>
                    <p>Settings</p>
                </button>
            </DialogTrigger>
            <DialogContent className={"p-0"}>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>
                            Settings
                        </DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                <div className={"flex h-80"}>
                    <div className={"flex flex-col bg-secondary w-max h-full rounded-l-md border-r border-main/40 p-2"}>

                        <ToggleGroup
                            type="single"
                            className={"flex flex-col gap-2 border-0 bg-transparent px-0 justify-start items-start"}
                            value={tab}
                            onValueChange={setTab}
                        >
                            <ToggleGroupItem value="profile" className={"w-full text-left text-md px-2 h-8 data-[state=on]:bg-tertiary border border-transparent data-[state=on]:border-main/60"}>
                                Profile
                            </ToggleGroupItem>
                            <ToggleGroupItem value="integrations" className={"w-full text-left text-md px-2 h-8 data-[state=on]:bg-tertiary border border-transparent data-[state=on]:border-main/60"}>
                                Integrations
                            </ToggleGroupItem>
                            <ToggleGroupItem value="settings" className={"w-full text-left text-md px-2 h-8 data-[state=on]:bg-tertiary border border-transparent data-[state=on]:border-main/60"}>
                                Settings
                            </ToggleGroupItem>
                        </ToggleGroup>

                    </div>

                    <div className={"flex flex-col w-full h-full p-4 gap-4"}>
                        {tab === "profile" &&
                            <ProfileSection session={session} onClose={() => setOpen(false)}/>
                        }
                        {tab === "integrations" &&
                            <div className={"grid grid-cols-2 gap-4"}>
                                {integrationList.map((integration) => (
                                    <div
                                        data-state={integration.active ? "active" : "inactive"}
                                        key={integration.name}
                                        className={cn(
                                            "group w-full h-32 flex flex-col gap-2 items-center justify-between rounded-md bg-secondary border-2 p-2 pt-4",
                                            "data-[state=active]:bg-success/5 data-[state=inactive]:bg-error/5",
                                            "data-[state=active]:border-success/20 data-[state=inactive]:border-error/20"
                                        )}
                                    >
                                        <integration.icon className={"size-8"}/>
                                        <div className={"flex flex-col gap-2 items-center"}>
                                            <p className={"py-1 text-xs group-data-[state=active]:text-success group-data-[state=inactive]:text-error"}>
                                                {integration.active ? "Active" : "Inactive"}
                                            </p>
                                            <Button variant={"ghost"} onClick={() => integration.active ? integration.onDisconnect() : integration.onConnect()}>
                                                {integration.active ? "Disconnect" : "Connect"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}

interface ProfileProps {
    session: any,
    onClose: () => void
}

const ProfileSection: React.FC<ProfileProps> = ({session, onClose}) => {
    const {updateUser} = useSessionStore()
    const {addToast} = useToast()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image)
    const [blob, setBlob] = useState<PutBlobResult | undefined>(undefined)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const formSchema = z.object({
        name: z.string()
            .min(3, {message: "Please enter more than 3 charcaters."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user?.name,
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const file = inputFileRef.current?.files ? inputFileRef.current.files[0] : null

            let imageUrl = session?.user?.image || null;

            if (file) {
                const uploadedBlob = await handleUpload();
                imageUrl = uploadedBlob?.url || imageUrl;
            }

            await authClient.updateUser({
                image: imageUrl,
                name: values.name,
            });

            updateUser({ image: imageUrl, name: values.name })

            addToast({
                title: "Successfully updated your profile",
                icon: <UserRoundCheck size={24} className={"text-brand"}/>
            })

            onClose()
        } catch (error) {
            addToast({
                title: "An error occurred while uploading your avatar",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
        }
    }

    const handleUpload = async () => {
        try {
            const file = inputFileRef.current!.files![0]
            setUploading(true)

            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: inputFileRef.current!.files![0],
            })

            const data = (await response.json()) as PutBlobResult;
            setBlob(data)
            return data

        } catch (error) {
            addToast({
                title: "An error occurred while uploading your avatar",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
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

            await authClient.updateUser({
                image: null
            })

            updateUser({ image: null })

            onClose()
            addToast({
                title: "Successfully removed your avatar",
                icon: <UserRoundCheck size={24} className={"text-brand"}/>
            })
        } catch (error) {
            addToast({
                title: "An error occurred while removing your avatar",
                icon: <CloudAlert size={24} className={"text-error"}/>
            })
        }
    }

    return (
        <div className={"flex flex-col gap-4 h-full justify-between"}>
            <div className={"flex flex-col gap-4 h-full"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between space-y-4 h-full">
                        <div className="flex items-center justify-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={blob?.url || avatarUrl || undefined} />
                                <AvatarFallback/>
                            </Avatar>
                            <div className="flex items-center justify-center space-x-4">
                                <Input
                                    ref={inputFileRef}
                                    id="picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={() => setAvatarUrl(URL.createObjectURL(inputFileRef.current!.files![0]))}
                                    className="hidden"
                                />
                                <FormLabel
                                    htmlFor="picture"
                                    className="flex items-center cursor-pointer rounded-md bg-secondary p-2 text-secondary hover:bg-tertiary"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    <span>Change Picture</span>
                                </FormLabel>
                                {(blob?.url || avatarUrl) &&
                                    <Button
                                        type={"button"}
                                        className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error"}
                                        onClick={handleDelete}
                                    >
                                        <Trash size={20}/>
                                    </Button>
                                }
                            </div>
                        </div>
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
                        <div className={"w-full flex gap-2 justify-end"}>
                            <Button
                                className={"w-max"}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"brand"}
                                className={"w-max"}
                                type={"submit"}
                                disabled={form.formState.isSubmitting || uploading}
                            >
                                {(form.formState.isSubmitting || uploading) && <ButtonSpinner/>}
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export {SettingsDialog}