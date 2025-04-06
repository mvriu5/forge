import type { Session } from "@/lib/auth"
import {create} from "zustand/react"

interface SessionStore {
    session: Session | null
    setSession: (session: Session | null) => void
    updateUser: (update: Partial<Session["user"]>) => void
    fetchSession: () => Promise<Session | null>
}


export const useSessionStore = create<SessionStore>((set, get) => ({
    session: null,
    setSession: (session: Session | null) => set({session}),
    updateUser: (update: Partial<Session["user"]>) =>
        set((state) => ({
            session: state.session
                ? { ...state.session, user: { ...state.session.user, ...update } }
                : null
        })),
    fetchSession: async () => {
        try {
            const response = await fetch("/api/auth/get-session")

            if (!response.ok) {
                set({session: null})
                return null
            }

            const data = await response.json()

            if (!data) {
                set({session: null})
                return data
            }

            set({session: data})
        } catch (error) {
            set({session: null})
        }
    }
}))