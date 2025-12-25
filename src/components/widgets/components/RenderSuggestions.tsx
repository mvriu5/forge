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
    items: CommandItem[]
    command: (item: CommandItem) => void
    range: Range
    close?: () => void
}

/**
 * RenderSuggestions
 *
 * - Mounts a ReactRenderer for NodeCommandList
 * - Creates a tippy popup when position info (clientRect) is available
 * - Attaches a pointerdown handler to the tippy popper element if available,
 *   otherwise falls back to a document-level capture handler. The handler will
 *   invoke the corresponding item command({ editor, range }) when a
 *   button[role="menuitem"] inside the popup is pointer-clicked
 * - Cleans up handlers and destroys popup/renderer on exit
 */
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
                if (!props) {
                    return
                }

                const targetEl = pev.target as HTMLElement | null
                if (!targetEl) return

                const tippyRoot = targetEl.closest("[data-tippy-root]") as HTMLElement | null
                const rootEl = (tippyRoot ?? reactRenderer?.element) as HTMLElement | null
                if (!rootEl) {
                    return
                }

                if (!rootEl.contains(targetEl)) return

                const btn = targetEl.closest('button[role="menuitem"]') as HTMLButtonElement | null
                if (!btn) return

                try {
                    pev.preventDefault()
                    pev.stopPropagation()
                } catch (e) {
                    // ignore
                }

                const buttons = Array.from(rootEl.querySelectorAll('button[role="menuitem"]'))
                const index = buttons.indexOf(btn)
                if (index === -1) return

                const item = props.items?.[index]
                if (!item || item.disabled) return

                try {
                    if (typeof item.command === "function") {
                        item.command({ editor: props.editor, range: props.range })
                    } else if (typeof props.command === "function") {
                        props.command(item)
                    }
                } catch (err) {
                    // swallow command errors
                } finally {
                    safeHideAndFocus(props.editor)
                }
            } catch (err) {
                // swallow unexpected errors
            }
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
                ;(pointerHandlerTarget as Element).removeEventListener("pointerdown", pointerHandler, true)
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

    const createPopupIfNeeded = (props: RenderSuggestionsProps) => {
        if (!props?.clientRect) return
        try {
            const instances = tippy(document.body as Element, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: reactRenderer?.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                hideOnClick: false,
            })
            popup = Array.isArray(instances) ? instances[0] : (instances as unknown as TippyInstance)

            try {
                const popperEl =
                    (popup as any)?.popper ||
                    (popup as any)?.popperElement ||
                    (popup as any)?.popperInstance?.state?.elements?.popper ||
                    null
                if (popperEl && (popperEl as Element).addEventListener) {
                    attachPointerHandler(popperEl as Element)
                } else {
                    attachPointerHandler(document)
                }
            } catch (err) {
                attachPointerHandler(document)
            }
        } catch (err) {
            popup = null
        }
    }

    return {
        onStart: (props: RenderSuggestionsProps) => {
            latestProps = props

            const wrappedProps: RenderSuggestionsProps = {
                ...props,
                close: () => safeHideAndFocus(props.editor),
                command: (item: CommandItem) => {
                    try {
                        props.command?.(item)
                    } finally {
                        safeHideAndFocus(props.editor)
                    }
                },
            }

            reactRenderer = new ReactRenderer(NodeCommandList, {
                editor: props.editor,
                props: wrappedProps,
            })

            try {
                const el = reactRenderer.element
                if (el) {
                    attachPointerHandler(el)
                }
            } catch (err) {
                // ignore
            }

            createPopupIfNeeded(props)
        },

        onUpdate: (props: RenderSuggestionsProps) => {
            latestProps = props
            try {
                reactRenderer?.updateProps({ ...props, close: () => safeHideAndFocus(props.editor) })
            } catch (err) {
                // ignore
            }

            try {
                if (popup && props.clientRect) {
                    popup.setProps({ getReferenceClientRect: props.clientRect })
                } else if (!popup && props.clientRect) {
                    createPopupIfNeeded(props)
                }
            } catch (err) {
                // ignore
            }
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
            try {
                popup?.destroy()
            } catch (err) {
                // ignore
            }
            try {
                reactRenderer?.destroy()
            } catch (err) {
                // ignore
            }
            popup = null
            reactRenderer = null
            latestProps = null
        },
    }
}

export default RenderSuggestions