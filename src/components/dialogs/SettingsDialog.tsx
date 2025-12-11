"use client"

import React, {useCallback, useMemo, useRef, useState} from "react"
import {
    Blocks,
    Check,
    CircleUserRound,
    LayoutDashboard,
    Pencil,
    Settings as SettingsIcon,
    Trash,
    User,
    Wrench,
    X
} from "lucide-react"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {cn} from "@/lib/utils"
import {authClient} from "@/lib/auth-client"
import type {PutBlobResult} from "@vercel/blob"
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/Dialog"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/ToggleGroup"
import {Button} from "@/components/ui/Button"
import {Form, FormField, FormInput, FormItem, FormLabel, FormMessage} from "@/components/ui/Form"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar"
import {Input} from "@/components/ui/Input"
import {Github, Google} from "@/components/svg/Icons"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {Dashboard, Settings} from "@/database"
import {useTooltip} from "@/components/ui/TooltipProvider"
import {RadioGroup} from "@/components/ui/RadioGroup"
import {RadioGroupBox} from "@/components/ui/RadioGroupBox"
import {Spinner} from "@/components/ui/Spinner"
import {useSession} from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {useDashboards} from "@/hooks/data/useDashboards"
import {useSettings} from "@/hooks/data/useSettings"
import {toast} from "sonner"

function SettingsDialog() {
    const {userId} = useSession()
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("profile")

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => setOpen(prev)}
        >
            <DialogTrigger asChild onClick={() => setTab("profile")}>
                <button
                    type={"button"}
                    className={"w-full flex gap-2 px-2 py-1 items-center rounded-md hover:bg-secondary hover:text-primary ring-0 outline-0"}
                >
                    <SettingsIcon size={16} className={"text-tertiary"}/>
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
                            onValueChange={(value) => {
                                if (value) setTab(value)

                            }}
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
                            <ProfileSection onClose={() => setOpen(false)}/>
                        }
                        {tab === "integrations" &&
                            <IntegrationSection userId={userId} setOpen={setOpen}/>
                        }
                        {tab === "dashboards" &&
                            <DashboardSection userId={userId}/>
                        }
                        {tab === "settings" &&
                            <SettingsSection onClose={() => setOpen(false)}/>
                        }
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}

interface IntegrationProps {
    setOpen: (open: boolean) => void
    userId: string | undefined
}

const IntegrationSection = ({setOpen, userId}: IntegrationProps) => {
    const {integrations, removeIntegration, handleIntegrate} = useIntegrations(userId)
    const githubIntegration = useMemo(() => getIntegrationByProvider(integrations, "github"), [integrations])
    const googleIntegration = useMemo(() => getIntegrationByProvider(integrations, "google"), [integrations])

    const integrationList = [
        {
            name: "Github",
            icon: Github,
            active: !!githubIntegration,
            onConnect: async () => {
                void handleIntegrate("github", false)
                setOpen(false)
            },
            onDisconnect: () => removeIntegration("github")
        },
        {
            name: "Google",
            icon: Google,
            active: !!googleIntegration,
            onConnect: async () => {
                void handleIntegrate("google", false)
                setOpen(false)
            },
            onDisconnect: () => removeIntegration("google")
        }
    ]

    return (
        <div className={"grid grid-cols-2 gap-4"}>
            {integrationList.map((integration) => (
                <div
                    data-state={integration.active ? "active" : "inactive"}
                    key={integration.name}
                    className={cn(
                        "relative group w-full h-20 flex flex-col items-center justify-center rounded-md bg-secondary border p-2 ring-2",
                        "data-[state=active]:border-success/40 data-[state=inactive]:border-error/40",
                        "dark:data-[state=active]:border-success/20 dark:data-[state=inactive]:border-error/20",
                        "data-[state=active]:ring-success/15 data-[state=inactive]:ring-error/15",
                        "dark:data-[state=active]:ring-success/5 dark:data-[state=inactive]:ring-error/5"
                    )}
                >
                    <div className={"flex items-center gap-2 bg-tertiary px-2 py-1 rounded-md"}>
                        <integration.icon className={"size-4 fill-secondary"}/>
                        <p>{integration.name}</p>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                        <Button
                            variant={"ghost"}
                            className={"text-xs text-tertiary font-normal hover:bg-0 hover:underline p-0 font-mono shadow-none"}
                            onClick={() => integration.active ? integration.onDisconnect() : integration.onConnect()}
                        >
                            {integration.active ? "Disconnect" : "Connect"}
                        </Button>
                    </div>
                    <div className={"z-[60] absolute right-1 top-1 text-xs group-data-[state=active]:bg-success/20 group-data-[state=inactive]:bg-error/20 dark:group-data-[state=active]:bg-success/10 dark:group-data-[state=inactive]:bg-error/10 rounded-md p-0.5"}>
                        <p>{integration.active ? <Check size={16} className={"text-success"}/> : <X size={16} className={"text-error"}/>}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

interface ProfileProps {
    onClose: () => void
}

const ProfileSection = ({onClose}: ProfileProps) => {
    const {session, updateUser} = useSession()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(session?.user?.image ?? "")
    const [blob, setBlob] = useState<PutBlobResult | undefined>(undefined)

    const inputFileRef = useRef<HTMLInputElement>(null)

    const formSchema = z.object({
        name: z.string().min(3, {message: "Please enter more than 3 characters."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user?.name,
        }
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
            onClose()
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
            onClose()
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
                        <div className="w-full flex items-center gap-4">
                            <div className="relative w-min inline-flex">
                                <Button
                                    type={"button"}
                                    className="relative size-16 p-0 overflow-hidden shadow-none rounded-full"
                                    onClick={() => inputFileRef.current?.click()}
                                    aria-label={avatarUrl ? "Change image" : "Upload image"}
                                >
                                    {avatarUrl ? (
                                        <Avatar className={"size-16"}>
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

interface DashboardProps {
    userId: string | undefined,
}

const DashboardSection = ({userId}: DashboardProps) => {
    const {dashboards = [], updateDashboard, removeDashboard} = useDashboards(userId, null)

    return (
        <ScrollArea className={"h-full"} thumbClassname={"bg-white/5"}>
            <div className={"flex flex-col gap-4"}>
                {dashboards?.map(dashboard => (
                    <DashboardItem
                        key={dashboard.id}
                        dashboard={dashboard}
                        dashboards={dashboards ?? []}
                        onUpdate={updateDashboard}
                        removeDashboard={removeDashboard}
                    />
                ))}
            </div>
        </ScrollArea>
    )
}

interface DashboardItemProps {
    dashboard: Dashboard
    dashboards: Dashboard[]
    onUpdate: (d: Dashboard) => Promise<any>
    removeDashboard: (id: string) => Promise<any>
}

const DashboardItem = ({dashboard, dashboards, onUpdate, removeDashboard}: DashboardItemProps) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const editTooltip = useTooltip<HTMLButtonElement>({
        message: "Edit this dashboard",
        anchor: "bc",
        delay: 800
    })

    const deleteTooltip = useTooltip<HTMLButtonElement>({
        message: "Delete this dashboard",
        anchor: "bc",
        delay: 800
    })

    const formSchema = z.object({
        name: z.string()
            .min(3, {message: "Please enter more than 3 characters."})
            .max(12, {message: "Please enter less than 12 characters."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: dashboard.name
        }
    })

    const isDuplicateName = useCallback((name: string) => (dashboards ?? []).some((dashboard) => dashboard.name === name), [dashboards])

    const handleUpdate = async (values: z.infer<typeof formSchema>) => {
        if (isDuplicateName(values.name)) {
            form.setError("name", {type: "validate", message: "A dashboard with this name already exists."})
            return
        }

        await onUpdate({ ...dashboard, name: values.name })
        toast.success("Successfully updated dashboard!")
        setEditDialogOpen(false)
    }

    const handleDelete = async () => {
        setDeleteLoading(true)
        await removeDashboard(dashboard.id)
        toast.success("Successfully deleted dashboard!")
        setDeleteLoading(false)
        setDeleteDialogOpen(false)
    }

    return (
        <div key={dashboard.id} className={"w-full flex items-center justify-between gap-2 bg-tertiary border border-main/20 rounded-md py-2 px-4"}>
            <p className={"text-primary"}>{dashboard.name}</p>
            <div className={"flex items-center"}>
                <Dialog
                    open={editDialogOpen}
                    onOpenChange={() => {
                        setEditDialogOpen(!editDialogOpen)
                        if (!editDialogOpen) form.reset()
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            type={"button"}
                            className={"px-1.5 rounded-r-none border-r-0"}
                            {...editTooltip}
                        >
                            <Pencil size={16}/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={"md:min-w-[300px] p-4"}>
                        <DialogHeader className={"flex flex-row justify-between items-start"}>
                            <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                                Edit dashboard
                            </DialogTitle>
                            <DialogClose/>
                        </DialogHeader>
                        <div className={"flex flex-col gap-4"}>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(handleUpdate)}
                                    className="flex flex-col justify-between gap-4 h-full"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormInput placeholder="Name" {...field}/>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className={"w-full flex gap-2 justify-end"}>
                                        <Button
                                            className={"w-max"}
                                            type={"reset"}
                                            onClick={() => {
                                                setEditDialogOpen(false)
                                                form.reset()
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant={"brand"}
                                            className={"w-max"}
                                            type={"submit"}
                                            disabled={form.formState.isSubmitting || dashboard.name === form.getValues().name}
                                        >
                                            {(form.formState.isSubmitting) && <Spinner/>}
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type={"button"}
                            className={"px-1.5 bg-error/10 text-error/80 border-error/20 hover:bg-error/20 hover:text-error rounded-l-none"}
                            {...deleteTooltip}
                        >
                            <Trash size={16}/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={"w-[380px] p-4"}>
                        <DialogHeader className={"flex flex-row justify-between items-start"}>
                            <DialogTitle className={"flex flex-col gap-2 text-lg font-semibold"}>
                                Delete dashboard
                            </DialogTitle>
                            <DialogClose/>
                        </DialogHeader>
                        <div className={"w-full flex flex-col gap-2 justify-end"}>
                            Are you sure you want to delete this dashboard?

                            <div className={"flex items-center gap-2 justify-end"}>
                                <Button
                                    className={"w-max"}
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant={"error"}
                                    className={"w-max"}
                                    onClick={handleDelete}
                                >
                                    {deleteLoading && <Spinner/>}
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}


interface SettingsProps {
    onClose: () => void
}

const SettingsSection = ({onClose}: SettingsProps) => {
    const {userId} = useSession()
    const {settings, updateSettings, updateSettingsStatus} = useSettings(userId)

    const formSchema = z.object({
        hourFormat: z.enum(["12", "24"])
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hourFormat: settings?.config?.hourFormat ?? "24"
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const newConfig = {
            hourFormat: values.hourFormat
        }

        if (!settings) return

        const newSettings: Settings = {
            id: settings.id,
            userId: settings.userId,
            lastDashboardId: settings.lastDashboardId,
            config: newConfig,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        }

        await updateSettings(newSettings)
        toast.success("Successfully updated your settings!")
        onClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
                {!settings ? (
                    <div className={"w-full h-full flex items-center justify-center"}>
                        <Spinner/>
                    </div>
                ) : (
                    <>
                        <div className="w-full flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="hourFormat"
                                render={({ field }) => (
                                    <FormItem className={"w-full"}>
                                        <FormLabel>Hour format</FormLabel>
                                        <RadioGroup
                                            {...field}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid-cols-2 "
                                        >
                                            <RadioGroupBox
                                                title={"12h"}
                                                value={"12"}
                                                id={"12h-format"}
                                                compareField={field.value}
                                            />
                                            <RadioGroupBox
                                                title={"24h"}
                                                value={"24"}
                                                id={"24h-format"}
                                                compareField={field.value}
                                            />
                                        </RadioGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className={"w-full flex gap-2 justify-end"}>
                            <Button
                                type={"button"}
                                className={"w-max"}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"brand"}
                                className={"w-max"}
                                type={"submit"}
                                disabled={form.formState.isSubmitting || updateSettingsStatus === "pending"}
                            >
                                {(form.formState.isSubmitting || updateSettingsStatus === "pending") && <Spinner/>}
                                Save
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    )
}

export {SettingsDialog}