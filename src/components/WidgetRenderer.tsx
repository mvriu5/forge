"use client"

import React, { useMemo } from "react"
import { WidgetContainer } from "@/components/widgets/base/WidgetContainer"
import { useSession } from "@/hooks/data/useSession"
import { useWidgets } from "@/hooks/data/useWidgets"
import {getWidgetDefinition} from "@/lib/definitions"
import { WidgetRuntimeProps } from "@tryforgeio/sdk"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {WidgetError} from "@/components/widgets/base/WidgetError"

export const WidgetRenderer: React.FC<WidgetRuntimeProps> = ({widget, editMode, isDragging, onWidgetDelete}) => {
    const { userId } = useSession()
    const { updateWidget } = useWidgets(userId)
    const { integrations, isLoading: isLoadingIntegrations, handleIntegrate } = useIntegrations(userId)

    const definition = useMemo(() => getWidgetDefinition(widget.widgetType), [widget.widgetType])
    const { Component, defaultConfig, name, integration: requiredIntegration } = definition
    const config = (widget.config ?? defaultConfig) as typeof defaultConfig

    const integrationAccount = useMemo(() => getIntegrationByProvider(integrations, requiredIntegration), [integrations, requiredIntegration])
    const missingIntegration = requiredIntegration && !integrationAccount?.accessToken

    const updateConfig = async (updater: | typeof defaultConfig | ((prev: typeof defaultConfig) => typeof defaultConfig)) => {
        const current = (widget.config ?? defaultConfig) as typeof defaultConfig
        const next = typeof updater === "function" ? (updater as (prev: typeof defaultConfig) => typeof defaultConfig)(current) : updater

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

    if (missingIntegration && !isLoadingIntegrations) {
        return (
            <WidgetContainer
                id={widget.id}
                widget={widget}
                name={definition.name}
                editMode={editMode}
                onWidgetDelete={onWidgetDelete}
            >
                <WidgetError
                    message={`If you want to use the ${name} widget, please integrate your ${requiredIntegration} account first.`}
                    actionLabel={"Integrate"}
                    onAction={() => requiredIntegration && handleIntegrate(requiredIntegration)}
                />
            </WidgetContainer>
        )
    }

    return (
        <WidgetContainer
            id={widget.id}
            widget={widget}
            name={definition.name}
            editMode={editMode}
            onWidgetDelete={onWidgetDelete}
        >
            <Component
                widget={widget as any}
                config={config}
                updateConfig={updateConfig as any}
                editMode={editMode}
                isDragging={isDragging}
                onWidgetDelete={onWidgetDelete}
            />
        </WidgetContainer>
    )
}