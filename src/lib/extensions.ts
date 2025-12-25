import { defaultCommandItems } from "@/components/widgets/components/NodeCommandList"
import RenderSuggestions, { CommandItem } from "@/components/widgets/components/RenderSuggestions"
import { Extension } from "@tiptap/core"
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion"

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        slashSuggestion: {
            setSlashSuggestion: () => ReturnType
        }
    }
}

export interface SlashSuggestionOptions {
    suggestion?: Partial<SuggestionOptions>
    commandItems: CommandItem[]
    options?: any
}

const fallbackItem: CommandItem = {
    title: "No results found",
    description: "",
    searchTerms: [],
    icon: undefined,
    disabled: true,
    command: () => {}
}


export const filterCommandItems = (query: string | undefined,commandItems: CommandItem[] = defaultCommandItems): CommandItem[] => {
    const search = query?.toLowerCase().trim() ?? ""
    if (!search) return commandItems

    const matchingItems = commandItems.filter((item) => {
        const title = item.title.toLowerCase()
        return (title.includes(search) || search.split(" ").every((word) => title.includes(word)))
    })

    return matchingItems.length > 0 ? matchingItems : [fallbackItem]
}

const SlashSuggestion = Extension.create<SlashSuggestionOptions>({
    name: "slash-suggestion",

    addOptions() {
        return {
            commandItems: [] as CommandItem[],
            suggestion: {
                char: "/",
                command: ({ editor, range, props }: { editor: any, range: any, props: any }) => {
                    props.command({ editor, range })
                },
                items: ({ query }: { query: string }) => {
                    return filterCommandItems(query)
                },
                render: () => {
                    let component: ReturnType<typeof RenderSuggestions>

                    return {
                        onStart: (props: any) => {
                            component = RenderSuggestions()
                            component.onStart(props)
                        },
                        onUpdate(props: any) {
                            component.onUpdate(props)
                        },
                        onKeyDown(props: any) {
                            if (props.event.key === "Escape") return true
                            return component.onKeyDown?.(props) ?? false
                        },
                        onExit() {
                            component.onExit()
                        }
                    }
                }
            }
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                render: RenderSuggestions,
            } as SuggestionOptions)
        ]
    }
})

export default SlashSuggestion
