import { getNotionAccount } from "@/database"
import {
    NOTION_VERSION,
    blocksToPlainText,
    getTitleFromProperties
} from "@/lib/notion"
import { NextResponse } from "next/server"

async function getAccessToken(userId: string) {
    const account = (await getNotionAccount(userId))[0]
    return account?.accessToken ?? null
}

async function fetchPage(accessToken: string, pageId: string) {
    const fetchWithAuth = (url: string) => fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        }
    })

    const [pageResponse, blocksResponse] = await Promise.all([
        fetchWithAuth(`https://api.notion.com/v1/pages/${pageId}`),
        fetchWithAuth(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`)
    ])

    if (!pageResponse.ok || !blocksResponse.ok) return null

    const pageData = await pageResponse.json()
    const blocksData = await blocksResponse.json()

    const expandChildren = async (blocks: any[]): Promise<any[]> => {
        const expandedBlocks = await Promise.all(blocks.map(async (block: any) => {
            if (!block?.has_children) return block

            const childResponse = await fetchWithAuth(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`)
            if (!childResponse.ok) return block

            const childData = await childResponse.json()
            return {
                ...block,
                children: await expandChildren(childData.results ?? [])
            }
        }))

        return expandedBlocks
    }

    const expandedBlocks = await expandChildren(blocksData.results ?? [])

    return {
        id: pageId,
        title: getTitleFromProperties(pageData.properties),
        plainText: blocksToPlainText(expandedBlocks),
        blocks: expandedBlocks
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
    let userId: string | undefined = undefined
    const { pageId } = await params

    try {
        const { searchParams } = new URL(req.url)
        userId = searchParams.get("userId") ?? undefined

        if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

        const accessToken = await getAccessToken(userId)
        if (!accessToken) return NextResponse.json({ error: "Notion integration missing or expired" }, { status: 401 })

        const page = await fetchPage(accessToken, pageId)
        if (!page) return NextResponse.json({ error: "Unable to load the Notion page" }, { status: 502 })

        return NextResponse.json(page, { status: 200 })
    } catch (error) {
        if (error instanceof NextResponse) throw error
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
