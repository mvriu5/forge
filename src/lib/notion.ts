import type { JSONContent } from "@tiptap/core"

export const NOTION_VERSION = "2025-09-03"

type RichText = {
    plain_text?: string
    text?: { content?: string }
    href?: string | null
    annotations?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
        strikethrough?: boolean
        code?: boolean
    }
}

type BlockData = {
    rich_text?: RichText[]
    language?: string
    checked?: boolean
    icon?: { emoji?: string }
}

export type NotionBlock = {
    type?: string
    children?: NotionBlock[]
    [key: string]: unknown
}

type NotionProperty = { type?: string; title?: RichText[] }

const getBlockData = (block: NotionBlock): BlockData => {
    if (!block.type) return {}
    const value = block[block.type]
    return value && typeof value === "object" ? value as BlockData : {}
}

export function getTitleFromProperties(properties: Record<string, unknown> | undefined) {
    if (!properties) return "Untitled"
    for (const value of Object.values(properties)) {
        const property = value && typeof value === "object" ? value as NotionProperty : null
        if (property?.type === "title" && Array.isArray(property.title)) {
            return property.title.map((text) => text.plain_text ?? "").join("").trim() || "Untitled"
        }
    }
    return "Untitled"
}

function reduceBlockToPlainText(block: NotionBlock): string {
    return (getBlockData(block).rich_text ?? [])
        .map((text) => text.plain_text ?? text.text?.content ?? "")
        .join("")
}

export function blocksToPlainText(blocks: NotionBlock[]): string {
    return blocks.map(reduceBlockToPlainText).filter(Boolean).join("\n\n")
}

function richTextToTextNodes(richText: RichText[] | undefined): JSONContent[] {
    if (!richText?.length) return []

    return richText.flatMap((item): JSONContent[] => {
        const text = item.plain_text ?? item.text?.content
        if (!text) return []

        const marks: NonNullable<JSONContent["marks"]> = []
        if (item.annotations?.bold) marks.push({ type: "bold" })
        if (item.annotations?.italic) marks.push({ type: "italic" })
        if (item.annotations?.underline) marks.push({ type: "underline" })
        if (item.annotations?.strikethrough) marks.push({ type: "strike" })
        if (item.annotations?.code) marks.push({ type: "code" })
        if (item.href) marks.push({ type: "link", attrs: { href: item.href } })

        return [{ type: "text", text, ...(marks.length ? { marks } : {}) }]
    })
}

function paragraphFromRichText(richText: RichText[] | undefined, prefixText?: string): JSONContent {
    const content = richTextToTextNodes(richText)
    if (prefixText) content.unshift({ type: "text", text: prefixText })
    return { type: "paragraph", content: content.length ? content : [] }
}

function buildListItem(block: NotionBlock): JSONContent {
    const content = [paragraphFromRichText(getBlockData(block).rich_text), ...blocksToNodes(block.children ?? [])]
    return { type: "listItem", content }
}

function convertBlock(block: NotionBlock): JSONContent | JSONContent[] | null {
    if (!block.type) return null
    const data = getBlockData(block)

    if (block.type === "paragraph") return paragraphFromRichText(data.rich_text)
    if (["heading_1", "heading_2", "heading_3"].includes(block.type)) {
        return {
            type: "heading",
            attrs: { level: Number(block.type.at(-1)) },
            content: richTextToTextNodes(data.rich_text),
        }
    }
    if (block.type === "quote") {
        return { type: "blockquote", content: [paragraphFromRichText(data.rich_text), ...blocksToNodes(block.children ?? [])] }
    }
    if (block.type === "code") {
        return {
            type: "codeBlock",
            attrs: { language: data.language ?? null },
            content: richTextToTextNodes(data.rich_text),
        }
    }
    if (block.type === "to_do") {
        return [
            paragraphFromRichText(data.rich_text, data.checked ? "[x] " : "[ ] "),
            ...blocksToNodes(block.children ?? []),
        ]
    }
    if (block.type === "callout") {
        return {
            type: "blockquote",
            content: [
                paragraphFromRichText(data.rich_text, data.icon?.emoji ? `${data.icon.emoji} ` : "💡 "),
                ...blocksToNodes(block.children ?? []),
            ],
        }
    }

    const text = reduceBlockToPlainText(block)
    return text ? { type: "paragraph", content: [{ type: "text", text }] } : null
}

function blocksToNodes(blocks: NotionBlock[]): JSONContent[] {
    const nodes: JSONContent[] = []
    let index = 0

    while (index < blocks.length) {
        const type = blocks[index]?.type
        if (type === "bulleted_list_item" || type === "numbered_list_item") {
            const items: JSONContent[] = []
            while (index < blocks.length && blocks[index]?.type === type) {
                items.push(buildListItem(blocks[index]))
                index += 1
            }
            nodes.push({ type: type === "bulleted_list_item" ? "bulletList" : "orderedList", content: items })
            continue
        }

        const node = convertBlock(blocks[index])
        if (Array.isArray(node)) nodes.push(...node)
        else if (node) nodes.push(node)
        index += 1
    }

    return nodes
}

export function blocksToJSONContent(blocks: NotionBlock[]): JSONContent {
    const nodes = blocksToNodes(blocks)
    return { type: "doc", content: nodes.length ? nodes : [{ type: "paragraph", content: [] }] }
}
