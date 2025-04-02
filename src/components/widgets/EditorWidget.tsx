"use client"

import type React from "react"
import {useState} from "react"
import {
    EditorRoot,
    EditorContent,
    type JSONContent,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandList,
    EditorCommandItem, handleCommandNavigation,
    EditorBubble
} from "novel"
import {defaultExtensions} from "@/lib/extensions"
import {WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import {slashCommand, suggestionItems} from "@/components/SlashCommand"
import {ScrollArea} from "lunalabs-ui"
import {NodeSelector } from "../NodeSelector"
import {TextButtons} from "@/components/TextButtons"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import AutoJoiner from "tiptap-extension-auto-joiner"


const EditorWidget: React.FC = () => {
    const [content, setContent] = useState<JSONContent | undefined>(undefined)
    const [openNode, setOpenNode] = useState(false)

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

    return (
        <WidgetTemplate className={"max-row-span-2"}>
            <EditorRoot>
                <EditorContent
                    extensions={extensions}
                    initialContent={content}
                    immediatelyRender={false}
                    className="relative p-2 rounded-md min-h-full w-full border border-main/40 bg-secondary"
                    editorProps={{
                        handleDOMEvents: {keydown: (_view, event) => handleCommandNavigation(event)},
                        attributes: {class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",},
                    }}
                    onUpdate={({ editor }) => {
                        const json = editor.getJSON()
                        setContent(json)
                    }}
                >
                    <EditorCommand className="z-50 w-72 rounded-md border border-main/60 bg-primary shadow-md transition-all">
                        <EditorCommandEmpty className="flex items-center justify-center px-2 text-tertiary">No results</EditorCommandEmpty>
                        <ScrollArea className="h-80">
                            <EditorCommandList className={"p-2 pr-4"}>
                                {suggestionItems.map((item) => (
                                    <EditorCommandItem
                                        value={item.title}
                                        onCommand={(val) => item.command && item.command(val)}
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
                        tippyOptions={{
                            placement: "top",
                        }}
                        className='flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-main bg-primary shadow-lg'>
                        <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                        <TextButtons />
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </WidgetTemplate>
    )
}

export { EditorWidget }
