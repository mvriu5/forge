import { getNotionAccount } from "@/database"
import {
    NOTION_VERSION,
    blocksToPlainText,
    getTitleFromProperties
} from "@/lib/notion"
import { NextResponse } from "next/server"
import posthog from "posthog-js"

const routePath = "/api/notion/pages/[pageId]"

async function getAccessToken(userId: string) {
    const account = (await getNotionAccount(userId))[0]
    return account?.accessToken ?? null
}

async function fetchPage(accessToken: string, pageId: string) {
    const [pageResponse, blocksResponse] = await Promise.all([
        fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            }
        }),
        fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            }
        })
    ])

    if (!pageResponse.ok || !blocksResponse.ok) return null

    const pageData = await pageResponse.json()
    const blocksData = await blocksResponse.json()

    return {
        id: pageId,
        title: getTitleFromProperties(pageData.properties),
        plainText: blocksToPlainText(blocksData.results ?? [])
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
    let userId: string | null = null
    const { pageId } = await params

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId")

        if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

        const accessToken = await getAccessToken(userId)
        if (!accessToken) return NextResponse.json({ error: "Notion integration missing or expired" }, { status: 401 })

        const page = await fetchPage(accessToken, pageId)
        if (!page) return NextResponse.json({ error: "Unable to load the Notion page" }, { status: 502 })

        return NextResponse.json(page, { status: 200 })
    } catch (error) {
        posthog.captureException(error, { route: routePath, method: "GET", userId, pageId })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
