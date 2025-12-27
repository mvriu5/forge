"use client"

import { Button } from "@/components/ui/Button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Skeleton } from "@/components/ui/Skeleton"
import { getHeaderValue, GmailLabel, GmailMessage } from "@/hooks/useGoogleMail"
import { cn, formatDate, getTimeLabel } from "@/lib/utils"
import { Link } from "@react-email/components"
import { CircleDashed, CircleFadingArrowUp, ExternalLink, File, Loader, MessageSquareDot, Send, Speech, ThumbsUp, Trash2, TriangleAlert, UserLock } from "lucide-react"
import { useCallback, useMemo } from "react"
import { useTooltip } from "../ui/TooltipProvider"

interface InboxDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    message: GmailMessage | null
    labels?: GmailLabel[]
    isPending?: boolean
}

function base64UrlToUint8Array(base64UrlData: string) {
    let base64 = base64UrlData.replace(/-/g, "+").replace(/_/g, "/")

    while (base64.length % 4) base64 += "="
    try {
        const binaryString = atob(base64)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
    } catch {
        return new Uint8Array()
    }
}

function base64UrlDecodeToString(base64UrlData: string) {
    const bytes = base64UrlToUint8Array(base64UrlData)

    try {
        const decoder = new TextDecoder("utf-8")
        return decoder.decode(bytes)
    } catch {
        return String.fromCharCode(...Array.from(bytes))
    }
}

function findBodyPart(payload: any): { mimeType: string; data: string } | null {
    if (!payload) return null

    if (payload.body && payload.body.data && payload.mimeType) {
        const mime = payload.mimeType.toLowerCase()
        if (mime === "text/html" || mime === "text/plain") {
            return { mimeType: mime, data: payload.body.data }
        }
    }

    if (Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
            const found = findBodyPart(part)
            if (found && found.mimeType === "text/html") return found
        }
        for (const part of payload.parts) {
            const found = findBodyPart(part)
            if (found && found.mimeType === "text/plain") return found
        }
    }

    return null
}

function InboxDialog({ open, onOpenChange, message, labels = [], isPending = false }: InboxDialogProps) {
    const subject = useMemo(() => getHeaderValue(message, "Subject") ?? "(No subject)", [message])
    const sender = useMemo(() => getHeaderValue(message, "From") ?? "", [message])
    const senderTitle = useMemo(() => sender.split('<')[0], [sender])
    const senderMail = useMemo(() => sender.split('<')[1]?.replace(/[<>]/g, ""), [sender])
    const date = useMemo(() => getHeaderValue(message, "Date") ?? "", [message])

    const openGmailTooltip = useTooltip<HTMLButtonElement>({
        message: "Open in Gmail",
        anchor: "tc"
    })

    const transformedLabels = useMemo(() => (labels ?? []).map((label) => {
        let name = (label.name ?? "").toString()

        if (name.startsWith("CATEGORY_")) name = name.slice("CATEGORY_".length)
        name = name.replace(/_/g, " ").toLowerCase().trim()

        const displayName = name.charAt(0).toUpperCase() + name.slice(1)

        return { ...label, displayName }
    }), [labels])

    const renderedBody = useMemo(() => {
        if (!message) return null

        const part = findBodyPart(message.payload)
        if (part?.data) {
            const decoded = base64UrlDecodeToString(part.data)
            if (part.mimeType === "text/html") {
                return { html: decoded, isHtml: true }
            } else {
                const escaped = decoded.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                const withBreaks = escaped.replace(/\r?\n/g, "<br/>")
                return { html: `<pre class="whitespace-pre-wrap wrap-break-word m-0">${withBreaks}</pre>`, isHtml: true }
            }
        }

        if (message.raw) {
            try {
                const raw = base64UrlDecodeToString(message.raw)

                const htmlMatch = raw.match(/Content-Type: text\/html;[\s\S]*?\r\n\r\n([\s\S]*)/i)
                if (htmlMatch && htmlMatch[1]) return { html: htmlMatch[1], isHtml: true }

                return { html: `<pre class="whitespace-pre-wrap wrap-break-word m-0">${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`, isHtml: true }
            } catch {
                return null
            }
        }

        if (message.snippet) {
            const escaped = message.snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;")
            return { html: `<pre class="whitespace-pre-wrap wrap-break-word m-0">${escaped}</pre>`, isHtml: true }
        }

        return null
    }, [message])

    const stripGlobalTags = useCallback((html: string) => (
        html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
            .replace(/<link[\s\S]*?>/gi, '')
            .replace(/<meta[\s\S]*?>/gi, '')
    ), [])

    const cleanedBody = useMemo(() => stripGlobalTags(renderedBody?.html || ''), [renderedBody])

    const renderLabels = useCallback(() => {
        return (
            <div className="w-full flex items-center gap-2 mt-2">
                {transformedLabels.map((label, index) => (
                    <div
                        key={`label-${label.id}-${message?.id}-${index}`}
                        className={cn(
                            "flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md border border-success/20 text-success bg-success/5",
                            label.name === "IMPORTANT" && "bg-error/5 border-error/20 text-error",
                            label.name === "UNREAD" && "bg-brand/5 border-brand/20 text-brand",
                            label.name === "SENT" && "bg-warning/5 border-warning/20 text-warning",
                            label.name === "SPAM" || label.name === "DRAFT" && "bg-purple-500/5 border-purple-500/20 text-purple-500",
                            label.name === "INBOX" && "hidden"
                        )}
                    >
                        {label.name === "IMPORTANT" && <TriangleAlert size={12}/>}
                        {label.name === "UNREAD" && <MessageSquareDot size={12}/>}
                        {label.name === "CATEGORY_FORUMS" && <Speech size={12}/>}
                        {label.name === "CATEGORY_UPDATES" && <Loader size={12}/>}
                        {label.name === "CATEGORY_PERSONAL" && <UserLock size={12}/>}
                        {label.name === "CATEGORY_PROMOTIONS" && <CircleFadingArrowUp size={12}/>}
                        {label.name === "CATEGORY_SOCIAL" && <ThumbsUp size={12}/>}
                        {label.name === "SENT" && <Send size={12} />}
                        {label.name === "SPAM" && <Trash2 size={12} />}
                        {label.name === "DRAFT" && <CircleDashed size={12} />}
                        {label.displayName}
                    </div>
                ))}
            </div>
        )
    }, [transformedLabels])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogTrigger asChild>
                <div className="h-max flex flex-col p-2 rounded-md cursor-pointer bg-secondary/50 hover:bg-secondary">
                    <div className="flex flex-wrap items-center gap-x-2">
                        <p className="text-primary font-semibold">{senderTitle}</p>
                        <p className="text-tertiary font-mono text-xs">{senderMail}</p>
                    </div>
                    <p className="text-xs text-tertiary/50 font-mono mb-1">{getTimeLabel(date)}</p>
                    <p className="text-xs text-secondary">{message?.snippet}</p>
                    {renderLabels()}
                </div>
            </DialogTrigger>

            <DialogContent className={"md:min-w-200 max-w-[90vw] h-[80vh] max-h-[80vh] w-full overflow-hidden gap-0 p-4 flex flex-col"}>
                <DialogHeader className={"flex flex-row items-start justify-between gap-2"}>
                    <div className="flex-1 min-w-0">
                        {renderLabels()}

                        <DialogTitle className={"flex items-center gap-2 text-lg font-semibold wrap-break-word"}>
                            {isPending ? <Skeleton className={"h-6 w-48"} /> : subject}
                            <Link
                                href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(subject)}`}
                                target="_blank"
                                rel="noreferrer noopener">
                                <Button variant={"ghost"} className={"px-1.5"} {...openGmailTooltip}>
                                    <ExternalLink size={16}/>
                                </Button>
                            </Link>
                        </DialogTitle>
                        <div className="text-sm text-secondary">
                            {isPending ? (
                                <>
                                    <Skeleton className={"h-4 w-48"} />
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-primary">{senderTitle}</span>
                                        <span className="font-medium text-tertiary">{senderMail}</span>
                                    </div>
                                    <div className="text-xs font-mono text-tertiary">
                                        {date ? formatDate(date, undefined) : ""}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogClose className={"p-1"} />

                </DialogHeader>

                <div className="flex-1 overflow-hidden rounded-md border border-main/40 mt-2">
                    {isPending ? (
                        <div className="p-2">
                            <Skeleton className={"h-6 w-1/3 mb-2"} />
                            <Skeleton className={"h-4 w-full mb-2"} />
                            <Skeleton className={"h-4 w-full mb-2"} />
                            <Skeleton className={"h-4 w-3/4"} />
                        </div>
                    ) : (
                        <ScrollArea className="h-[72vh] bg-primary">
                            {renderedBody ? (
                                <div
                                    className=" max-w-full"
                                    dangerouslySetInnerHTML={{ __html: cleanedBody }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-tertiary p-8">
                                    <div className="size-16 flex items-center justify-center rounded-md bg-secondary/10">
                                        <File size={28} />
                                    </div>
                                    <p className="text-sm">No preview available</p>
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { InboxDialog }
