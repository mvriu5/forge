import {JSONContent} from "novel"

export const NOTION_VERSION = "2025-09-03"

export function getTitleFromProperties(properties: Record<string, any> | undefined) {
    if (!properties) return "Untitled"
    for (const key of Object.keys(properties)) {
        const prop = properties[key]
        if (prop?.type === "title" && Array.isArray(prop?.title) && prop.title.length > 0) {
            return prop.title.map((t: any) => t.plain_text ?? "").join("").trim() || "Untitled"
        }
    }
    return "Untitled"
}

function reduceBlockToPlainText(block: any): string {
    if (!block) return ""
    const richText = block[block.type]?.rich_text ?? []
    if (Array.isArray(richText)) {
        return richText.map((text: any) => text.plain_text ?? text.text?.content ?? "").join("")
    }
    return ""
}

export function blocksToPlainText(blocks: any[]): string {
    return blocks
        .map(reduceBlockToPlainText)
        .filter(Boolean)
        .join("\n\n")
}

function reduceBlockToJSON(block: any): JSONContent | null {
    if (!block?.type) return null

    const richText = block[block.type]?.rich_text ?? []
    const text = Array.isArray(richText)
        ? richText.map((t: any) => t.plain_text ?? t.text?.content ?? "").join("")
        : ""

    if (!text || typeof text !== "string") return null

    if (block.type.startsWith("heading_")) {
        const level = Number(block.type.replace("heading_", ""))
        const clampedLevel = Math.min(Math.max(level || 1, 1), 3)

        return {
            type: "heading",
            attrs: { level: clampedLevel },
            content: [{ type: "text", text }]
        }
    }

    return {
        type: "paragraph",
        content: [{ type: "text", text }]
    }
}

export function blocksToJSONContent(blocks: any[]): JSONContent {
    const nodes = blocks
        .map(reduceBlockToJSON)
        .filter(Boolean) as JSONContent[]

    if (nodes.length === 0) {
        return { type: "doc", content: [{ type: "paragraph", content: [] }] }
    }

    return {
        type: "doc",
        content: nodes
    }
}

function richTextToTextNodes(richText: any[] | undefined): JSONContent[] {
    if (!Array.isArray(richText) || richText.length === 0) return []

    return richText
        .map((item: any) => {
            const text = item?.plain_text ?? item?.text?.content
            if (!text) return null

            const marks: JSONContent[] = []
            const annotations = item?.annotations ?? {}

            if (annotations.bold) marks.push({ type: "bold" })
            if (annotations.italic) marks.push({ type: "italic" })
            if (annotations.underline) marks.push({ type: "underline" })
            if (annotations.strikethrough) marks.push({ type: "strike" })
            if (annotations.code) marks.push({ type: "code" })

            if (item?.href) {
                marks.push({ type: "link", attrs: { href: item.href } })
            }

            return {
                type: "text",
                text,
                ...(marks.length > 0 ? { marks } : {})
            }
        })
        .filter(Boolean) as JSONContent[]
}

function paragraphFromRichText(richText: any[] | undefined, prefixText?: string): JSONContent {
    const content = richTextToTextNodes(richText)

    if (prefixText) {
        content.unshift({ type: "text", text: prefixText })
    }

    return {
        type: "paragraph",
        content: content.length > 0 ? content : [{ type: "text", text: "" }]
    }
}

function buildListItem(block: any): JSONContent {
    const blockData = block?.[block.type] ?? {}
    const itemContent: JSONContent[] = [paragraphFromRichText(blockData.rich_text)]

    const children = Array.isArray(block?.children) ? block.children : []
    const childNodes = blocksToNodes(children)
    if (childNodes.length > 0) itemContent.push(...childNodes)

    return { type: "listItem", content: itemContent }
}

function convertBlock(block: any): JSONContent | JSONContent[] | null {
    if (!block?.type) return null

    const blockData = block[block.type] ?? {}

    if (block.type === "paragraph") {
        return paragraphFromRichText(blockData.rich_text)
    }

    if (block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3") {
        const level = block.type === "heading_1" ? 1 : block.type === "heading_2" ? 2 : 3
        return {
            type: "heading",
            attrs: { level },
            content: richTextToTextNodes(blockData.rich_text)
        }
    }

    if (block.type === "quote") {
        const quoteContent: JSONContent[] = [paragraphFromRichText(blockData.rich_text)]
        const children = blocksToNodes(block.children ?? [])
        if (children.length > 0) quoteContent.push(...children)
        return { type: "blockquote", content: quoteContent }
    }

    if (block.type === "code") {
        const text = (blockData.rich_text ?? []).map((rt: any) => rt?.plain_text ?? rt?.text?.content ?? "").join("")
        return {
            type: "codeBlock",
            attrs: { language: blockData.language ?? null },
            content: [{ type: "text", text }]
        }
    }

    if (block.type === "to_do") {
        const checked = Boolean(blockData.checked)
        const prefix = checked ? "[x] " : "[ ] "
        const paragraph = paragraphFromRichText(blockData.rich_text, prefix)
        const children = blocksToNodes(block.children ?? [])
        if (children.length === 0) return paragraph
        return [paragraph, ...children]
    }

    if (block.type === "callout") {
        const emoji = blockData.icon?.emoji
        const prefix = emoji ? `${emoji} ` : "💡 "
        const calloutContent: JSONContent[] = [paragraphFromRichText(blockData.rich_text, prefix)]
        const children = blocksToNodes(block.children ?? [])
        if (children.length > 0) calloutContent.push(...children)
        return { type: "blockquote", content: calloutContent }
    }

    const text = reduceBlockToPlainText(block)
    if (text) {
        return {
            type: "paragraph",
            content: [{ type: "text", text }]
        }
    }

    return null
}

function blocksToNodes(blocks: any[]): JSONContent[] {
    const nodes: JSONContent[] = []
    let index = 0

    while (index < blocks.length) {
        const block = blocks[index]
        const type = block?.type

        if (type === "bulleted_list_item" || type === "numbered_list_item") {
            const listType = type === "bulleted_list_item" ? "bulletList" : "orderedList"
            const listItems: JSONContent[] = []

            while (index < blocks.length && blocks[index]?.type === type) {
                listItems.push(buildListItem(blocks[index]))
                index += 1
            }

            nodes.push({ type: listType, content: listItems })
            continue
        }

        const node = convertBlock(block)
        if (Array.isArray(node)) {
            nodes.push(...node)
        } else if (node) {
            nodes.push(node)
        }
        index += 1
    }

    return nodes
}

export function plainTextToJSONContent(text: string): JSONContent {
    const paragraphs = text.split(/\n\n+/).map((paragraph) => paragraph.trim()).filter(Boolean)
    if (paragraphs.length === 0) {
        return { type: "doc", content: [{ type: "paragraph", content: [] }] }
    }

    return {
        type: "doc",
        content: paragraphs.map((paragraph) => ({
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: paragraph
                }
            ]
        }))
    }
}
