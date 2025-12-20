import {NextResponse} from "next/server"
import {getNotionAccount} from "@/database"
import PostHogClient from "@/app/posthog"
const posthog = PostHogClient()
import {NOTION_VERSION, getTitleFromProperties} from "@/lib/notion"

const routePath = "/api/notion/pages"

async function getAccessToken(userId: string) {
    const account = (await getNotionAccount(userId))[0]
    return account?.accessToken ?? null
}

type NotionPage = {
    id: string
    title: string
    isChild: boolean
    parentId: string | null
}

async function fetchChildPages(accessToken: string, pageId: string): Promise<NotionPage[]> {
    const childPages: NotionPage[] = []
    let cursor: string | undefined

    do {
        const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`)
        url.searchParams.set("page_size", "100")

        if (cursor) url.searchParams.set("start_cursor", cursor)

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            }
        })

        if (!response.ok) {
            const detail = await response.text()
            throw new Error(`Unable to load child pages: ${detail}`)
        }

        const data = await response.json()
        const pages = (data.results ?? [])
            .filter((block: any) => block.type === "child_page")
            .map((block: any) => ({
                id: block.id as string,
                title: block.child_page?.title ?? "Untitled",
                isChild: true,
                parentId: pageId
            }))

        childPages.push(...pages)
        cursor = data.next_cursor ?? undefined
    } while (cursor)

    return childPages
}

export async function GET(req: Request) {
    let userId: string | undefined = undefined

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId") ?? undefined

        if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

        const accessToken = await getAccessToken(userId)
        if (!accessToken) return NextResponse.json({ error: "Notion integration missing or expired" }, { status: 401 })

        const response = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filter: { property: "object", value: "page" },
                page_size: 50,
            })
        })

        if (!response.ok) {
            const detail = await response.text()
            return NextResponse.json({ error: "Failed to load Notion pages", detail }, { status: response.status })
        }

        const data = await response.json()
        const initialPages = (data.results ?? []).map((result: any) => ({
            id: result.id as string,
            title: getTitleFromProperties(result.properties),
            isChild: false,
            parentId: result.parent?.page_id ?? null
        }))

        const allPages: NotionPage[] = []
        const visited = new Set<string>()
        const queue: NotionPage[] = [...initialPages]

        while (queue.length > 0) {
            const current = queue.shift()!
            if (visited.has(current.id)) continue

            visited.add(current.id)
            allPages.push(current)

            try {
                const childPages = await fetchChildPages(accessToken, current.id)
                for (const child of childPages) {
                    if (!visited.has(child.id)) {
                        queue.push(child)
                    }
                }
            } catch (error) {
                posthog.captureException(error, current.id, { route: routePath, method: "GET", userId })
            }
        }

        return NextResponse.json({ pages: allPages }, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        posthog.captureException(error, userId, { route: routePath, method: "GET" })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
