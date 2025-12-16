"use client"

import React, {useCallback, useMemo} from "react"
import { WidgetContainer } from "@/components/widgets/base/WidgetContainer"
import { useSession } from "@/hooks/data/useSession"
import {getWidgetDefinition} from "@/lib/definitions"
import {BaseWidget, WidgetRuntimeProps} from "@tryforgeio/sdk"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {ErrorBoundary} from "react-error-boundary"

const areWidgetsEqual = (a: BaseWidget, b: BaseWidget): boolean => (
    a === b
    || (
        a.id === b.id
        && a.userId === b.userId
        && a.dashboardId === b.dashboardId
        && a.widgetType === b.widgetType
        && a.width === b.width
        && a.height === b.height
        && a.positionX === b.positionX
        && a.positionY === b.positionY
        && a.createdAt === b.createdAt
        && a.updatedAt === b.updatedAt
        && JSON.stringify(a.config ?? null) === JSON.stringify(b.config ?? null)
    )
)

export const WidgetRendererComponent: React.FC<WidgetRuntimeProps> = ({widget, editMode, isDragging, onWidgetDelete, onWidgetUpdate}) => {
    const { userId, isLoading: isLoadingSession } = useSession()
    const { integrations, isLoading: isLoadingIntegrations, handleIntegrate } = useIntegrations(userId)

    const definition = useMemo(() => getWidgetDefinition(widget.widgetType), [widget.widgetType])
    const { Component, defaultConfig, name, integration: requiredIntegration } = definition
    const config = (widget.config ?? defaultConfig) as typeof defaultConfig

    const integrationAccount = useMemo(() => getIntegrationByProvider(integrations, requiredIntegration), [integrations, requiredIntegration])
    const missingIntegration = requiredIntegration && !integrationAccount?.accessToken

    const updateConfig = useCallback(async (updater: | typeof defaultConfig | ((prev: typeof defaultConfig) => typeof defaultConfig)) => {
        const current = (widget.config ?? defaultConfig) as typeof defaultConfig
        const next = typeof updater === "function" ? (updater as (prev: typeof defaultConfig) => typeof defaultConfig)(current) : updater

        await onWidgetUpdate?.({
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
    }, [defaultConfig, onWidgetUpdate, widget])

    if (missingIntegration && !(isLoadingIntegrations || isLoadingSession)) {
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
            <ErrorBoundary
                resetKeys={[widget.id, widget.updatedAt]}
                fallbackRender={({ error, resetErrorBoundary }) => (
                    <WidgetError
                        message={`The ${name} widget failed to load.`}
                        details={error.message}
                        actionLabel="Retry"
                        onAction={resetErrorBoundary}
                    />
                )}
            >
                <Component
                    widget={widget as BaseWidget}
                    config={config}
                    updateConfig={updateConfig}
                    editMode={editMode}
                    isDragging={isDragging}
                    onWidgetDelete={onWidgetDelete}
                    onWidgetUpdate={onWidgetUpdate}
                />
            </ErrorBoundary>
        </WidgetContainer>
    )
}

export const WidgetRenderer = React.memo(WidgetRendererComponent, (prev, next) => (
    areWidgetsEqual(prev.widget as BaseWidget, next.widget as BaseWidget)
    && prev.editMode === next.editMode
    && prev.isDragging === next.isDragging
    && prev.onWidgetDelete === next.onWidgetDelete
    && prev.onWidgetUpdate === next.onWidgetUpdate
))
