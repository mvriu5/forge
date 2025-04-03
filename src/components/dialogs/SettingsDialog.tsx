"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button, Callout,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Form,
    FormField,
    FormInput,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    ToggleGroup,
    ToggleGroupItem, useToast
} from "lunalabs-ui"
import React, {useState} from "react"
import {Blocks, CloudAlert, Github, ImageIcon, Settings} from "lucide-react"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {useSessionStore} from "@/store/sessionStore"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {GoogleIcon} from "@/components/GoogleIcon"
import {useIntegrationStore} from "@/store/integrationStore"
import {cn} from "@/lib/utils"
import {authClient} from "@/lib/auth-client"

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
            <DialogContent className={"p-0 border-main/40"}>
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
                            <ProfileSection session={session} onClose={() => setOpen(false)} />
                        }
                        {tab === "integrations" &&
                            <div className={"grid grid-cols-2 gap-4"}>
                                {integrationList.map((integration) => (
                                    <div
                                        data-state={integration.active ? "active" : "inactive"}
                                        key={integration.name}
                                        className={cn(
                                            "group w-full h-32 flex flex-col gap-2 items-center justify-between rounded-md bg-secondary border border-main/40 p-2 pt-4",
                                            "data-[state=active]:bg-success/5 data-[state=inactive]:bg-error/5"
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
    session: any
    onClose: () => void
}

const ProfileSection: React.FC<ProfileProps> = ({session, onClose}) => {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
            let imageUrl = session?.user?.image || null

            if (file && !avatarUrl) {
                await handleUpload()
                imageUrl = avatarUrl
            } else if (avatarUrl) {
                imageUrl = avatarUrl
            }

            const response = await fetch("/api/user/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.name,
                    image: imageUrl,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update profile")
            }

            onClose()
        } catch (error) {
            console.error("Error updating profile:", error)
        }
    }

    const handleUpload = async (): Promise<string | null> => {
        if (!file) return null

        try {
            setUploading(true)

            const formData = new FormData()
            formData.append("file", file)

            // Upload the file to the server
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            setAvatarUrl(data.url)
            return data.url
        } catch (error) {
            console.error("Error uploading file:", error)
            return null
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={"flex flex-col gap-4 h-full justify-between"}>
            <div className={"flex flex-col gap-4"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarUrl || session?.user?.image || ""} />
                                <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex items-center justify-center space-x-4">
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0]
                                        setFile(file)
                                        setAvatarUrl(URL.createObjectURL(file))
                                    }
                                }}
                                className="hidden"
                            />
                            <FormLabel
                                htmlFor="picture"
                                className="cursor-pointer rounded-md bg-secondary p-2 text-muted-foreground hover:bg-secondary/80"
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                <span>Change Picture</span>
                            </FormLabel>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormInput placeholder="Name" className={"focus:ring-brand/40"} {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
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
                    {form.formState.isSubmitting || uploading ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    )
}

export {SettingsDialog}