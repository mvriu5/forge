"use client"

import { WidgetProps } from "@/lib/definitions"
import { defineWidget } from "@/lib/widget"
import React from "react"
import { WidgetContent } from "./base/WidgetContent"
import { WidgetError } from "./base/WidgetError"
import { isSafeFrameUrl } from "@/lib/frameUrl"

interface FrameConfig {
    url: string
    sizes?: any
}

const FrameWidget: React.FC<WidgetProps<FrameConfig>> = ({ config }) => {
    if (!isSafeFrameUrl(config.url)) {
        return <WidgetError message="Only public HTTPS URLs are allowed." />
    }

    return (
        <WidgetContent className="flex-1 flex items-center justify-center -m-2">
            <iframe
                src={config.url}
                title="Embedded content"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms allow-popups allow-presentation"
                referrerPolicy="no-referrer"
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
