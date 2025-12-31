"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { NodeViewContent, NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react"
import { useCallback, useEffect, useState } from "react"

interface CodeblockProps extends ReactNodeViewProps {
    updateAttributes: (attrs: { language?: string | null } & Record<string, any>) => void
    [key: string]: any
}

export default function Codeblock({ node, updateAttributes, extension }: CodeblockProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(node.attrs.language ?? "null")
    const languages = extension?.options?.lowlight?.listLanguages ? extension.options.lowlight.listLanguages() : []

    useEffect(() => {
        setSelectedLanguage(node.attrs.language ?? "null")
    }, [node.attrs.language])

    const handleValueChange = useCallback((value: string) => {
        setSelectedLanguage(value)

        const nextLanguage = value === "null" ? null : value
        if (nextLanguage === node.attrs.language) return

         updateAttributes({ language: nextLanguage })
    }, [node.attrs.language, updateAttributes])

    return (
        <NodeViewWrapper className="relative code-block border border-main/40 rounded-md bg-secondary">
            <Select value={selectedLanguage} onValueChange={handleValueChange}>
                <SelectTrigger className="absolute top-2 right-2 w-max h-6 text-xs" spellCheck={false}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className={"w-32 border-main/40"} align={"end"}>
                    <SelectItem value={"null"} className="h-6">auto</SelectItem>
                    {languages.map((lang: any) => (
                        <SelectItem key={lang} value={lang} className="h-6">
                            {lang}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <pre spellCheck={false}>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    )
}
