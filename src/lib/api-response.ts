import { NextResponse } from "next/server"
import type { ZodError } from "zod"

export type ApiErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UPSTREAM_ERROR"
    | "INTERNAL_ERROR"

export const apiError = (status: number, code: ApiErrorCode, message: string, details?: unknown) =>
    NextResponse.json({ error: { code, message, ...(details === undefined ? {} : { details }) } }, { status })

export const validationError = (error: ZodError) =>
    apiError(400, "BAD_REQUEST", "Invalid request.", error.flatten())

export const internalError = () =>
    apiError(500, "INTERNAL_ERROR", "Internal server error.")
