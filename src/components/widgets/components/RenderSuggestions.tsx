import { Editor, ReactRenderer } from "@tiptap/react"
import tippy, { Instance as TippyInstance } from "tippy.js"
import { SuggestionKeyDownProps } from "@tiptap/suggestion"
import NodeCommandList from "./NodeCommandList"

export interface Range {
    from: number
    to: number
}

export interface CommandItem {
    title: string
    description: string
    searchTerms: string[]
    icon: React.ReactNode
    command: (props: { editor: Editor, range: Range }) => void
    disabled?: boolean
}

export interface RenderSuggestionsProps {
    editor: Editor
    clientRect?: (() => DOMRect) | null
    items: CommandItem[]
    command: (item: CommandItem) => void
    range: Range
}

const RenderSuggestions = () => {
  let reactRenderer: ReactRenderer | null = null
  let popup: TippyInstance | null = null

    return {
        onStart: (props: RenderSuggestionsProps) => {
            if (!props || !props.items || props.items.length === 0 || !props.clientRect) return

            try {
                reactRenderer = new ReactRenderer(NodeCommandList, { editor: props.editor, props })
            } catch (err) {
                return
            }

            const instances = tippy(document.body as Element, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
            })

            popup = Array.isArray(instances) ? instances[0] : (instances as unknown as TippyInstance)
        },

        onUpdate: (props: RenderSuggestionsProps) => {
            if (reactRenderer) reactRenderer.updateProps(props)
            if (popup && props.clientRect) popup.setProps({getReferenceClientRect: props.clientRect})
        },

        onKeyDown: (props: SuggestionKeyDownProps): boolean => {
            if (props.event.key === "Escape") {
                popup?.hide()
                return true
            }

            return (reactRenderer?.ref as any)?.onKeyDown?.(props) ?? false
        },

        onExit: () => {
            popup?.destroy()
            reactRenderer?.destroy()
            popup = null
            reactRenderer = null
        }
    }
}

export default RenderSuggestions
