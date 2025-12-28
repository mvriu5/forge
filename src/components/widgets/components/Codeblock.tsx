import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import { JSX, useCallback, useEffect, useRef, useState } from "react"

interface CodeblockNode {
    attrs: {
        language?: string | null
        [key: string]: any
    }
    [key: string]: any
}

interface ExtensionWithLowlight {
    options: {
        lowlight: {
            listLanguages: () => string[]
        }
        [key: string]: any
    }
    [key: string]: any
}

interface CodeblockProps {
    node: CodeblockNode
    updateAttributes: (attrs: { language?: string | null } & Record<string, any>) => void
    extension: ExtensionWithLowlight
    [key: string]: any
}

export default function Codeblock({
    node: {
        attrs: { language: defaultLanguage },
    },
    updateAttributes,
    extension,
}: CodeblockProps) {

    const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage ?? "null")
    const [isMounted, setIsMounted] = useState(false)
    const updateFrameRef = useRef<number | null>(null)

    const languages = extension?.options?.lowlight?.listLanguages
        ? extension.options.lowlight.listLanguages()
        : []

    useEffect(() => {
        setSelectedLanguage(defaultLanguage ?? "null")
    }, [defaultLanguage])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        return () => {
            if (updateFrameRef.current !== null) {
                cancelAnimationFrame(updateFrameRef.current)
            }
        }
    }, [])

    const handleValueChange = useCallback((value: string) => {
        setSelectedLanguage(value)
        const nextLanguage = value === "null" ? null : value
        if (nextLanguage === defaultLanguage) return

        if (updateFrameRef.current !== null) {
            cancelAnimationFrame(updateFrameRef.current)
        }
        updateFrameRef.current = requestAnimationFrame(() => {
            updateFrameRef.current = null
            updateAttributes({ language: nextLanguage })
        })
    }, [defaultLanguage, updateAttributes])

    return (
        <NodeViewWrapper className="relative code-block border border-main/40 rounded-md bg-secondary">
                    <Select value={defaultLanguage ?? "null"} onValueChange={handleValueChange}>
                        <SelectTrigger className="absolute top-2 right-2 w-max h-6 text-xs" spellCheck={false}>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent className={"w-32 border-main/40"} align={"end"}>
                            <SelectItem value={"null"} className="h-6">auto</SelectItem>
                            {languages.map((lang) => (
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
