import {Settings, SettingsInsert} from "@/database"
import {create} from "zustand/react"

interface SettingsStore {
    settings: Settings | null
    fetchSettings: (userId: string) => Promise<void>
    updateSettings: (newSettings: Settings) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: null,

    fetchSettings: async (userId: string) => {
        const defaultSettings = {
            hourFormat: "24"
        }

        try {
            const response = await fetch(`/api/settings?userId=${userId}`)

            if (response.ok) {
                const settings = await response.json()
                if (settings[0]) {
                    set({ settings: settings[0] })
                    return
                }
            }

            const createRes = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, config: defaultSettings }),
            })
            if (!createRes.ok) throw new Error('Fehler beim Erstellen der Settings')

            const newSettings = await createRes.json()
            set({ settings: newSettings[0] })
        } catch (error) {
            set({ settings: null })
        }
    },

    updateSettings: async (newSettings: Settings) => {
        const {settings} = get()
        if (!settings) return

        try {
            let config: any
            if (newSettings.config) config = {...settings.config, ...newSettings.config}
            else config = settings.config

            const response = await fetch(`/api/settings?id=${settings.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newSettings, config })
            })

            if (!response.ok) throw new Error('Error updating settings')

            const updatedSettings = await response.json()

            set({ settings: updatedSettings[0] })
        } catch (error) {
            set({ settings })
        }
    }
}))
