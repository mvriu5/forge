import { initTRPC } from "@trpc/server"
import { ZodError } from "zod"
import type { db } from "./db"

export type Context = { db: typeof db };
export const createContext = async (): Promise<Context> => ({ db: (await import("./db")).db })

const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
        }
    }
})

export const router = t.router
export const publicProcedure = t.procedure