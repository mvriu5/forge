import type {Meta, StoryObj} from "@storybook/react"
import {BookmarkWidget} from "./BookmarkWidget"

const meta: Meta<typeof BookmarkWidget> = {
    title: "Components/BookmarkWidget",
    component: BookmarkWidget,
    parameters: { layout: "centered" },
    tags: ["autodocs"]
}

export default meta

type Story = StoryObj<typeof BookmarkWidget>

export const Default: Story = {
    render: () => {
        return (
           <BookmarkWidget id={0} editMode={false} />
        )
    }
}