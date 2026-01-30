"use client"

import React, { useState } from "react"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { defineWidget } from "@/lib/widget"
import { WidgetProps } from "@/lib/definitions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Edit, Globe } from "lucide-react"

interface FrameConfig {
    url: string
}

const FrameWidget: React.FC<WidgetProps<FrameConfig>> = ({ config, updateConfig }) => {
    const [inputValue, setInputValue] = useState(config.url || "")
    const [isEditing, setIsEditing] = useState(!config.url)

    const handleSave = () => {
        try {
            new URL(inputValue)
            if (updateConfig) {
                updateConfig({ url: inputValue })
            }
            setIsEditing(false)
        } catch {
            alert("Please enter a valid URL.")
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    return (
        <>
            <WidgetHeader title={isEditing ? "Edit Frame" : "Frame"}>
                {!isEditing && (
                    <Button variant="widget" onClick={handleEdit}>
                        <Edit size={16} />
                    </Button>
                )}
            </WidgetHeader>
            <WidgetContent>
                {isEditing || !config.url ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                        <Globe size={48} className="text-tertiary" />
                        <p className="text-center text-sm text-tertiary">
                            Embed content from another website.
                        </p>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="https://example.com"
                        />
                        <Button onClick={handleSave} className="w-full">Save</Button>
                    </div>
                ) : (
                    <iframe
                        src={config.url}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                    />
                )}
            </WidgetContent>
        </>
    )
}

export const frameWidgetDefinition = defineWidget({
    name: "Frame",
    component: FrameWidget,
    description: "Embed content from any website using an iframe.",
    image: "/bookmark_preview.svg",
    tags: ["custom", "embed"],
    sizes: {
        desktop: { width: 2, height: 2 },
        tablet: { width: 2, height: 2 },
        mobile: { width: 1, height: 1 },
    },
    defaultConfig: {
        url: "",
    },
})
