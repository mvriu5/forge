import {
    TiptapImage,
    TiptapLink,
    UpdatedImage,
    TaskList,
    TaskItem,
    HorizontalRule,
    StarterKit,
    Placeholder
} from "novel"

import { cx } from "class-variance-authority"


const placeholder = Placeholder
const tiptapLink = TiptapLink.configure({
    HTMLAttributes: {
        class: cx("text-info/60 underline underline-offset-[3px] hover:text-info transition-colors cursor-pointer")
    }
})

const taskList = TaskList.configure({
    HTMLAttributes: {
        class: cx("not-prose pl-2")
    }
})
const taskItem = TaskItem.configure({
    HTMLAttributes: {
        class: cx("flex items-start my-4")
    },
    nested: true
})

const horizontalRule = HorizontalRule.configure({
    HTMLAttributes: {
        class: cx("mt-4 mb-6 border-t border-main/60")
    }
})

const starterKit = StarterKit.configure({
    bulletList: {
        HTMLAttributes: {
            class: cx("list-disc list-outside leading-3 -mt-2")
        }
    },
    orderedList: {
        HTMLAttributes: {
            class: cx("list-decimal list-outside leading-3 -mt-2")
        }
    },
    listItem: {
        HTMLAttributes: {
            class: cx("leading-normal -mb-2")
        }
    },
    blockquote: {
        HTMLAttributes: {
            class: cx("border-l-2 border-white/50")
        }
    },
    codeBlock: {
        HTMLAttributes: {
            class: cx("rounded-sm bg-primary/50 border border-main/60 p-5 font-mono font-medium")
        }
    },
    code: {
        HTMLAttributes: {
            class: cx("rounded-md bg-primary/50 border border-main/60 px-1.5 py-1 font-mono font-medium"),
            spellcheck: "false"
        }
    },
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4
    },
    gapcursor: false
})

export const defaultExtensions = [
    starterKit,
    placeholder,
    TiptapLink,
    TiptapImage,
    UpdatedImage,
    taskList,
    taskItem,
    horizontalRule,
]