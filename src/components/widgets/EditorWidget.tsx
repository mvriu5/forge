"use client"

import type React from "react"
import {useState} from "react"
import {
    EditorRoot,
    EditorContent,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandList,
    EditorCommandItem, handleCommandNavigation,
    EditorBubble,
    EditorInstance
} from "novel"
import {defaultExtensions} from "@/lib/extensions"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {slashCommand, suggestionItems} from "@/components/widgets/components/SlashCommand"
import {ScrollArea} from "@/components/ui/ScrollArea"
import {NodeSelector } from "./components/NodeSelector"
import {TextButtons} from "@/components/widgets/components/TextButtons"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import AutoJoiner from "tiptap-extension-auto-joiner"
import {useWidgetStore} from "@/store/widgetStore"

const EditorWidget: React.FC<WidgetProps> = ({editMode, onWidgetDelete}) => {
    const {refreshWidget} = useWidgetStore()
    const [openNode, setOpenNode] = useState(false)
    const [saved, setSaved] = useState(true)

    const widget = useWidgetStore(state => state.getWidget("editor"))
    if (!widget) return null

    const extensions = [
        GlobalDragHandle.configure({
            dragHandleWidth: 20,
            scrollTreshold: 100,
        }),
        AutoJoiner.configure({
            elementsToJoin: ["bulletList", "orderedList"]
        }),
        ...defaultExtensions,
        slashCommand
    ]

    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        // biome-ignore lint/complexity/noForEach: <explanation>
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        });
        return new XMLSerializer().serializeToString(doc);
    };

    const handleSave = async (editor: EditorInstance) => {
        const json = editor.getJSON()
        const html = highlightCodeblocks(editor.getHTML())
        window.localStorage.setItem("html-content", highlightCodeblocks(html))

        setSaved(true)

        await refreshWidget({
            ...widget,
            config: {
                ...widget.config,
                content: json
            }
        })
    }

    return (
        <WidgetTemplate className={"col-span-2 row-span-2"} name={"editor"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <EditorRoot>
                <ScrollArea className="relative h-full">
                    <p className={"absolute z-50 top-2 right-2 text-tertiary/50 text-end text-sm"}>{saved ? "Saved" : "Unsaved"}</p>

                    <EditorContent
                        extensions={extensions}
                        initialContent={widget?.config?.content}
                        immediatelyRender={false}
                        onBlur={(params) => handleSave(params.editor)}
                        onUpdate={() => setSaved(false)}
                        className="p-2 rounded-md min-h-full w-full border border-main/40 bg-secondary"
                        editorProps={{
                            handleDOMEvents: {
                                keydown: (_view, event) => handleCommandNavigation(event)
                            },
                            attributes: {class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",},
                        }}
                    >
                        <EditorCommand className="z-50 w-72 rounded-md border border-main/60 bg-primary shadow-md transition-all">
                            <EditorCommandEmpty className="flex items-center justify-center px-2 text-tertiary">
                                No results
                            </EditorCommandEmpty>
                            <ScrollArea className="h-80">
                                <EditorCommandList className={"p-2 pr-4"}>
                                    {suggestionItems.map((item) => (
                                        <EditorCommandItem
                                            value={item.title}
                                            onCommand={(val) => item.command?.(val)}
                                            className="group cursor-pointer flex w-full items-center gap-2 rounded-md py-1 px-2 text-left text-sm hover:bg-secondary aria-selected:bg-secondary"
                                            key={item.title}
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-main/40 bg-primary group-hover:text-brand group-aria-selected:text-brand">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-primary">{item.title}</p>
                                                <p className="text-xs text-secondary">{item.description}</p>
                                            </div>
                                        </EditorCommandItem>
                                    ))}
                                </EditorCommandList>
                            </ScrollArea>
                        </EditorCommand>
                        <EditorBubble
                            tippyOptions={{placement: "top"}}
                            className='flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-main bg-primary shadow-lg'
                        >
                            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                            <TextButtons />
                        </EditorBubble>
                    </EditorContent>
                </ScrollArea>
            </EditorRoot>
        </WidgetTemplate>
    )
}

export { EditorWidget }