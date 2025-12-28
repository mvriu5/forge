import React, { ChangeEvent, JSX } from "react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"

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
}: CodeblockProps): JSX.Element {
    const onLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        updateAttributes({ language: event.target.value })
    }

    const languages = extension?.options?.lowlight?.listLanguages
        ? extension.options.lowlight.listLanguages()
        : []

    return (
        <NodeViewWrapper className="code-block">
            <select
                contentEditable={false}
                defaultValue={defaultLanguage ?? "null"}
                onChange={onLanguageChange}
            >
                <option value="null">auto</option>
                <option disabled>—</option>
                {languages.map((lang, index) => (
                    <option key={index} value={lang}>
                        {lang}
                    </option>
                ))}
            </select>

            <pre>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    )
}
