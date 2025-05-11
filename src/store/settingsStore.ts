import {Settings, SettingsInsert} from "@/database"
import {create} from "zustand/react"

interface SettingsStore {
    settings: Settings | null
    fetchSettings: (userId: string) => Promise<void>
    createInitialSettings: (settings: SettingsInsert) => Promise<void>
    updateSettings: (config: Record<string, any>) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: null,

    fetchSettings: async (userId: string) => {
        try {
            const response = await fetch(`/api/settings?userId=${userId}`)
            if (!response.ok) throw new Error('Error loading settings')
            const settings = await response.json()
            set({ settings })
        } catch (error) {
            set({ settings: null })
        }
    },

    createInitialSettings: async (settings: SettingsInsert) => {
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (!response.ok) throw new Error('Fehler beim Erstellen der Settings')

            const newSettings = await response.json()
            set({ settings: newSettings })
        } catch (error) {
            set({ settings: null})
        }
    },

    updateSettings: async (config: Record<string, any>) => {
        const {settings} = get()
        if (!settings) return

        try {
            const updatedConfig = {
                ...settings.config,
                ...config,
            }

            const response = await fetch(`/api/settings?id=${settings.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...settings, config: updatedConfig})
            })

            if (!response.ok) throw new Error('Fehler beim Aktualisieren der Settings')

            const updatedSettings = await response.json()

            set({ settings: updatedSettings })
        } catch (error) {
            set({ settings })
        }
    }
}))
