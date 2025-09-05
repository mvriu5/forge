import type {Meta, StoryObj} from "@storybook/react"
import {BookmarkWidget} from "./BookmarkWidget"
import {useBreakpoint} from "@forge/ui/hooks/useBreakpoint"
import {TooltipProvider} from "@forge/ui/components/TooltipProvider"

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
        const sizes = {
            desktop: { width: 1, height: 2 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 }
        }

        const {breakpoint} = useBreakpoint()

        return (
            <div className={"h-full w-full"}>
                <TooltipProvider>
                    <BookmarkWidget
                        widget={{
                            id: "1",
                            userId: "1",
                            dashboardId: "1",
                            widgetType: "bookmark",
                            height: sizes[breakpoint].height,
                            width: sizes[breakpoint].width,
                            config: {},
                            positionX: 0,
                            positionY: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }}
                        onUpdateBookmarks={() => Promise.resolve()}
                        editMode={false}
                        onWidgetDelete={() => {}}
                    />
                </TooltipProvider>
            </div>
        )
    }
}