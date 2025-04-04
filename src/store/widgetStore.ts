import {create} from "zustand/react"
import {Widget, WidgetInsert} from "@/database"

interface WidgetStore {
    widgets: Widget[] | null
    addWidget: (userId: string, widget: WidgetInsert) => Promise<void>
    refreshWidget: (widget: Widget) => Promise<void>
    removeWidget: (widget: Widget) => Promise<void>
    getWidget: (widgetName: string) => Widget | undefined
    getAllWidgets: (userId: string) => Promise<void>
}

export const useWidgetStore = create<WidgetStore>((set, get) => ({
    widgets: null,
    addWidget: async (userId: string, widget: WidgetInsert) => {
        try {
            const response = await fetch('/api/widgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...widget, userId })
            })
            const newWidget = await response.json()
            set({ widgets: [...(get().widgets || []), newWidget[0]] })
        } catch (error) {
            console.error('Failed to add widget', error)
        }
    },
    refreshWidget: async (widget: Widget) => {
        try {
            const response = await fetch(`/api/widgets/${widget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widget)
            })
            const updatedWidget = await response.json()
            set({
                widgets: get().widgets!.map((w) =>
                    w.id === updatedWidget[0].id ? updatedWidget[0] : w
                )
            })
        } catch (error) {
            console.error('Failed to update widget', error)
        }
    },
    removeWidget: async (widget: Widget) => {
        try {
            await fetch(`/api/widgets/${widget.id}`, { method: 'DELETE' })
            set({
                widgets: get().widgets!.filter((w) => w.id !== widget.id)
            })
        } catch (error) {
            console.error('Failed to delete widget', error)
        }
    },
    getWidget: (widgetName: string) => {
        return get().widgets!.find((widget) => widget.widgetType === widgetName)
    },
    getAllWidgets: async (userId: string) => {
        try {
            const response = await fetch(`/api/widgets?userId=${userId}`)
            const widgets = await response.json()
            set({ widgets })
        } catch (error) {
            console.error('Failed to fetch widgets', error)
        }
    }
}))