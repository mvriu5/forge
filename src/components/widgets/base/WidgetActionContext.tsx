"use client"

import {createContext, ReactNode, useContext} from "react"
import type {Widget} from "@/database"

type UpdateWidget = (widget: Widget) => Promise<unknown>

interface WidgetActionContextValue {
    updateWidget: UpdateWidget
}

const noop: UpdateWidget = async () => {
    return Promise.resolve()
}

const WidgetActionContext = createContext<WidgetActionContextValue>({
    updateWidget: noop,
})

interface WidgetActionProviderProps {
    value: WidgetActionContextValue
    children: ReactNode
}

const WidgetActionProvider = ({value, children}: WidgetActionProviderProps) => (
    <WidgetActionContext.Provider value={value}>
        {children}
    </WidgetActionContext.Provider>
)

const useWidgetActions = () => useContext(WidgetActionContext)

export {WidgetActionProvider, useWidgetActions}