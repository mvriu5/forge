"use client"

import React, { useMemo } from "react"
import { WidgetContainer } from "@/components/widgets/base/WidgetContainer"
import { useSession } from "@/hooks/data/useSession"
import { useWidgets } from "@/hooks/data/useWidgets"
import {getWidgetDefinition} from "@/lib/widgetRegistry"
import { WidgetRuntimeOuterProps } from "@forge/sdk"

export const WidgetRenderer: React.FC<WidgetRuntimeOuterProps> = ({widget, editMode, isDragging, onWidgetDelete}) => {
    const { userId } = useSession()
    const { updateWidget } = useWidgets(userId)
    const definition = useMemo(() => getWidgetDefinition(widget.widgetType), [widget.widgetType])
    const { Component, defaultConfig, type } = definition
    const config = (widget.config ?? defaultConfig) as typeof defaultConfig

    const updateConfig = async (updater: | typeof defaultConfig | ((prev: typeof defaultConfig) => typeof defaultConfig)) => {
        const current = (widget.config ?? defaultConfig) as typeof defaultConfig
        const next =
            typeof updater === "function"
                ? (updater as (prev: typeof defaultConfig) => typeof defaultConfig)(current)
                : updater

        await updateWidget({
            id: widget.id,
            userId: widget.userId,
            dashboardId: widget.dashboardId,
            widgetType: widget.widgetType,
            height: widget.height,
            width: widget.width,
            positionX: widget.positionX,
            positionY: widget.positionY,
            createdAt: widget.createdAt,
            updatedAt: widget.updatedAt,
            config: next as Record<string, any>,
        })
    }
    return (
        <WidgetContainer
            id={widget.id}
            widget={widget}
            name={definition.type}
            editMode={editMode}
            onWidgetDelete={onWidgetDelete}
        >
            <Component
                widget={widget as any}
                config={config as any}
                updateConfig={updateConfig as any}
                editMode={editMode}
                isDragging={isDragging}
                onWidgetDelete={onWidgetDelete}
            />
        </WidgetContainer>
    )
}