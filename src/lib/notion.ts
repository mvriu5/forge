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
