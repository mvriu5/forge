"use client"

import { WidgetProps } from "@/lib/definitions"
import { defineWidget } from "@/lib/widget"
import React from "react"
import { WidgetContent } from "./base/WidgetContent"

interface FrameConfig {
    url: string
    sizes?: any
}

const FrameWidget: React.FC<WidgetProps<FrameConfig>> = ({ config }) => {
    return (
        <WidgetContent className="flex-1 flex items-center justify-center -m-2">
            <iframe
                src={config.url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />
        </WidgetContent>
    )
}

export const frameWidgetDefinition = defineWidget({
    name: "Frame",
    component: FrameWidget,
    description: "Embed content from any website using an iframe.",
    image: "/frame_preview.svg",
    tags: [],
    sizes: {
        desktop: { width: 2, height: 2 },
        tablet: { width: 2, height: 2 },
        mobile: { width: 1, height: 1 },
    },
    defaultConfig: {
        url: ""
    }
})
