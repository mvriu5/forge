"use client"

import type React from "react"
import {useRef, useState} from "react"
import {
    Blocks,
    Check,
    CloudAlert,
    Github,
    ImageIcon,
    LayoutDashboard, Pencil,
    Settings, Share2,
    Trash,
    User,
    UserRoundCheck, Wrench,
    X
} from "lucide-react"
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
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/ToggleGroup"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Input} from "@/components/ui/Input"
import { LinearIcon } from "@/components/svg/LinearIcon"
import {useDashboardStore} from "@/store/dashboardStore"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {format} from "date-fns"
import {CopyButton} from "@/components/CopyButton"

function SettingsDialog() {
    const {session} = useSessionStore()
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("profile")

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
                            <ToggleGroupItem value="profile" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <User size={14}/>
                                Profile
                            </ToggleGroupItem>
                            <ToggleGroupItem value="integrations" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Blocks size={14}/>
                                Integrations
                            </ToggleGroupItem>
                            <ToggleGroupItem value="dashboards" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <LayoutDashboard size={14}/>
                                Dashboards
                            </ToggleGroupItem>
                            <ToggleGroupItem value="settings" className={"w-full flex items-center gap-1 text-left text-md px-2 h-8 data-[state=on]:bg-brand/5 border border-transparent data-[state=on]:border-brand/20 data-[state=on]:text-brand"}>
                                <Wrench size={14}/>
                                Settings
                            </ToggleGroupItem>
                        </ToggleGroup>

                    </div>

                    <div className={"flex flex-col w-full h-full p-4 gap-4"}>
                        {tab === "profile" &&
                            <ProfileSection session={session} onClose={() => setOpen(false)}/>
                        }
                        {tab === "integrations" &&
                            <IntegrationSection session={session} setOpen={setOpen}/>
                        }
                        {tab === "dashboards" &&
                            <DashboardSection/>
                        }
                        {tab === "settings" &&
                            <p className={"text-tertiary text-center mt-4 text-sm"}>Currently no settings available</p>
                        }
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}

interface IntegrationProps {
    setOpen: (open: boolean) => void
    session: any
}

const IntegrationSection = ({setOpen, session}: IntegrationProps) => {
    const {addIntegration, removeIntegration, githubIntegration, googleIntegration, linearIntegration} = useIntegrationStore()
    const {addToast} = useToast()

    const integrationList = [
        {
            name: "Github",
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
            name: "Google",
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
        },
        {
            name: "Linear",
            icon: LinearIcon,
            active: !!linearIntegration,
            onConnect: async () => {
                await authClient.signIn.oauth2({providerId: "linear"}, {
                    onRequest: (ctx) => {
                    },
                    onSuccess: (ctx) => {
                        addToast({
                            title: "Successfully integrated Linear",
                            icon: <Blocks size={24}/>
                        })
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
            onDisconnect: () => removeIntegration("linear")
        }
    ]

    return (
        <div className={"grid grid-cols-2 gap-4"}>
            {integrationList.map((integration) => (
                <div
                    data-state={integration.active ? "active" : "inactive"}
                    key={integration.name}
                    className={cn(
                        "relative group w-full h-20 flex flex-col items-center justify-center rounded-md bg-secondary border p-2",
                        "data-[state=active]:border-success/20 data-[state=inactive]:border-error/20"
                    )}
                >
                    <div className={"flex items-center gap-2 bg-tertiary px-2 py-1 rounded-md"}>
                        <integration.icon className={"size-4 fill-secondary"}/>
                        <p>{integration.name}</p>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                        <Button
                            variant={"ghost"}
                            className={"text-xs text-tertiary font-normal hover:bg-0 hover:underline p-0 font-mono"}
                            onClick={() => integration.active ? integration.onDisconnect() : integration.onConnect()}
                        >
                            {integration.active ? "Disconnect" : "Connect"}
                        </Button>
                    </div>
                    <div className={"z-[60] absolute right-1 top-1 text-xs group-data-[state=active]:bg-success/10 group-data-[state=inactive]:bg-error/10 rounded-md p-0.5"}>
                        <p>{integration.active ? <Check size={16} className={"text-success"}/> : <X size={16} className={"text-error"}/>}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

interface ProfileProps {
    session: any,
    onClose: () => void
}

const ProfileSection = ({session, onClose}: ProfileProps) => {
    const {updateUser} = useSessionStore()
    const {addToast} = useToast()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image)
    const [blob, setBlob] = useState<PutBlobResult | undefined>(undefined)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const formSchema = z.object({
        name: z.string()
            .min(3, {message: "Please enter more than 3 characters."})
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
                        <div className="flex flex-col justify-center gap-4">
                            <div className={"flex flex-col md:flex-row items-center gap-4"}>
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={blob?.url || avatarUrl || undefined} />
                                    <AvatarFallback/>
                                </Avatar>
                                <div className="flex items-center justify-center">
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
                                        className="h-8 flex items-center cursor-pointer rounded-l-md bg-secondary px-2 text-secondary hover:text-primary hover:bg-tertiary border border-main/40 border-r-0"
                                    >
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        <span>Change Picture</span>
                                    </FormLabel>
                                    {(blob?.url || avatarUrl) &&
                                        <Button
                                            type={"button"}
                                            className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error rounded-l-none"}
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
                        </div>
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


const DashboardSection = () => {
    const {dashboards} = useDashboardStore()

    const handleUpdate = (dashboardId: string) => {

    }

    const handleDelete = (dashboardId: string) => {

    }

    const handleCreateLink = (dashboardId: string) => {

    }

    return (
        <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
            <div className={"flex flex-col gap-4"}>
                {dashboards?.map(dashboard => (
                    <div key={dashboard.id} className={"w-full flex items-center justify-between gap-2 bg-tertiary rounded-md py-2 px-4"}>
                        <div className={"flex items-center gap-2"}>
                            <p className={"text-primary"}>{dashboard.name}</p>
                        </div>

                        <div className={"flex items-center"}>
                            <Button
                                type={"button"}
                                className={"px-1.5 rounded-r-none border-r-0"}
                                onClick={() => handleCreateLink(dashboard.id)}
                            >
                                <Pencil size={16}/>
                            </Button>
                            <CopyButton copyText={""} className={"px-1.5 rounded-none border border-main/60 border-r-0 text-secondary"}/>
                            <Button
                                type={"button"}
                                className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error rounded-l-none"}
                                onClick={() => handleDelete(dashboard.id)}
                            >
                                <Trash size={16}/>
                            </Button>
                        </div>
                    </div>

                ))}
            </div>
        </ScrollArea>
    )
}

export {SettingsDialog}