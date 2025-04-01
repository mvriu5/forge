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
import {Blocks, CloudAlert, Github, Settings} from "lucide-react"
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
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("profile")
    const {addToast} = useToast()
    const {session} = useSessionStore()
    const {addIntegration, removeIntegration, githubIntegration, googleIntegration} = useIntegrationStore()

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

    const onSubmit = () => {

    }

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
                    <div className={"flex flex-col bg-secondary w-max h-full rounded-l-md border-r border-main p-2"}>

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
                            <div className={"flex flex-col gap-4 h-full justify-between"}>
                                <div className={"flex flex-col gap-4"}>
                                    <div className={"flex items-center gap-4"}>
                                        <Avatar className={"size-12 border border-main/20"}>
                                            <AvatarImage src={session?.user?.image ?? ""}/>
                                            <AvatarFallback className={"bg-gradient-to-br from-green-400 to-brand"}/>
                                        </Avatar>
                                        <Input type={"file"}/>
                                    </div>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant={"brand"}
                                        className={"w-max"}
                                        disabled={form.getValues("name") === session?.user?.name}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
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

export {SettingsDialog}