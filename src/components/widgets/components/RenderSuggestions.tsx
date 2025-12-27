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
    command: (props: { editor: Editor; range: Range }) => void
    disabled?: boolean
}

export interface RenderSuggestionsProps {
    editor: Editor
    clientRect?: (() => DOMRect) | null
    decorationNode?: Element | null
    items: CommandItem[]
    command: (item: CommandItem) => void
    range: Range
    close?: () => void
    handlePointerDown?: boolean
}

const RenderSuggestions = () => {
    let reactRenderer: ReactRenderer | null = null
    let popup: TippyInstance | null = null
    let latestProps: RenderSuggestionsProps | null = null

    let pointerHandler: EventListener | null = null
    let pointerHandlerTarget: Element | Document | null = null

    const safeHideAndFocus = (editor?: any) => {
        try {
            popup?.hide()
        } catch (e) {
            // ignore
        }
        try {
            editor?.commands?.focus?.()
        } catch (e) {
            // ignore
        }
    }

    const attachPointerHandler = (target: Element | Document) => {
        if (pointerHandler) return
        pointerHandlerTarget = target

        pointerHandler = (ev: Event) => {
            try {
                const pev = ev as PointerEvent
                const props = latestProps
                if (!props) return

                const targetEl = pev.target as HTMLElement | null
                if (!targetEl) return

                const tippyRoot = targetEl.closest("[data-tippy-root]") as HTMLElement | null
                const rootEl = (tippyRoot ?? reactRenderer?.element) as HTMLElement | null
                if (!rootEl) return

                if (!rootEl.contains(targetEl)) return

                const btn = targetEl.closest('button[role="menuitem"]') as HTMLButtonElement | null
                if (!btn) return

                pev.preventDefault()
                pev.stopPropagation()

                const buttons = Array.from(rootEl.querySelectorAll('button[role="menuitem"]'))
                const index = buttons.indexOf(btn)
                if (index === -1) return

                const item = props.items?.[index]
                if (!item || item.disabled) return

                if (typeof item.command === "function") item.command({ editor: props.editor, range: props.range })
                else if (typeof props.command === "function") props.command(item)
                safeHideAndFocus(props.editor)
            } catch (error) {}
        }

        try {
            ;(pointerHandlerTarget as any).addEventListener("pointerdown", pointerHandler as any, true)
        } catch (err) {
            ;(document as any).addEventListener("pointerdown", pointerHandler as any, true)
            pointerHandlerTarget = document
        }
    }

    const detachPointerHandler = () => {
        if (!pointerHandler) return
        try {
            if (pointerHandlerTarget && (pointerHandlerTarget as Element).removeEventListener) {
                (pointerHandlerTarget as Element).removeEventListener("pointerdown", pointerHandler, true)
            } else {
                document.removeEventListener("pointerdown", pointerHandler, true)
            }
        } catch (err) {
            // ignore
        } finally {
            pointerHandler = null
            pointerHandlerTarget = null
        }
    }

    const createReferenceClientRect = (props: RenderSuggestionsProps): (() => DOMRect) => {
        return () => {
            const ySpacing = 92
            const xSpacing = 12

            if (props.decorationNode) {
                const rects = props.decorationNode.getClientRects()
                const rect = rects[0] ?? props.decorationNode.getBoundingClientRect()
                if (rect) return new DOMRect(rect.left + xSpacing, rect.bottom + ySpacing, 0, 0)
            }

            const decoRect = props.clientRect?.()
            if (!decoRect) return new DOMRect()

            return new DOMRect(decoRect.x + xSpacing, decoRect.y + decoRect.height + ySpacing, 0, 0)
        }
    }

    const createPopupIfNeeded = (props: RenderSuggestionsProps) => {
        if (!props?.editor.view) return

        try {
            const editorDom = props.editor?.view?.dom as HTMLElement | null
            const dialogContent = editorDom?.closest("[data-slot='dialog-content'], [role='dialog']") as HTMLElement | null
            const appendTarget = dialogContent ?? editorDom?.parentElement ?? null
            const referenceElement = (props.decorationNode as HTMLElement | null) ?? editorDom ?? null

            if (!appendTarget || !referenceElement) return

            const getReferenceClientRect = createReferenceClientRect(props)

            const instances = tippy(referenceElement, {
                getReferenceClientRect,
                appendTo: () => appendTarget,
                content: reactRenderer?.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "top-start",
                hideOnClick: false,
                popperOptions: { strategy: dialogContent ? "fixed" : "absolute" }
            })
            popup = Array.isArray(instances) ? instances[0] : (instances as unknown as TippyInstance)

            const popperEl =
                (popup as any)?.popper ||
                (popup as any)?.popperElement ||
                (popup as any)?.popperInstance?.state?.elements?.popper ||
                null
            if (popperEl && (popperEl as Element).addEventListener) attachPointerHandler(popperEl as Element)
            else attachPointerHandler(document)
        } catch (error) {}
    }

    return {
        onStart: (props: RenderSuggestionsProps) => {
            latestProps = props

            const wrappedProps: RenderSuggestionsProps = {
                ...props,
                handlePointerDown: false,
                close: () => safeHideAndFocus(props.editor),
                command: (item: CommandItem) => {
                    props.command?.(item)
                    safeHideAndFocus(props.editor)
                }
            }

            reactRenderer = new ReactRenderer(NodeCommandList, {
                editor: props.editor,
                props: wrappedProps,
            })

            const el = reactRenderer.element
            if (el) attachPointerHandler(el)
            createPopupIfNeeded(props)
        },

        onUpdate: (props: RenderSuggestionsProps) => {
            latestProps = props
            reactRenderer?.updateProps({
                ...props,
                handlePointerDown: false,
                close: () => safeHideAndFocus(props.editor),
            })
            if (!popup) createPopupIfNeeded(props)
        },

        onKeyDown: (props: SuggestionKeyDownProps): boolean => {
            if (props.event.key === "Escape") {
                safeHideAndFocus((reactRenderer as any)?.props?.editor)
                return true
            }
            return (reactRenderer?.ref as any)?.onKeyDown?.(props) ?? false
        },

        onExit: () => {
            detachPointerHandler()
            popup?.destroy()
            reactRenderer?.destroy()
            popup = null
            reactRenderer = null
            latestProps = null
        }
    }
}

export default RenderSuggestions
