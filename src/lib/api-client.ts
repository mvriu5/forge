export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly code?: string,
    ) {
        super(message)
        this.name = "ApiError"
    }
}

type ApiErrorBody = {
    error?: string | { message?: string; code?: string }
    message?: string
    code?: string
}

const readError = async (response: Response): Promise<{ message: string; code?: string }> => {
    const fallback = `Request failed (${response.status})`
    try {
        const body = await response.json() as ApiErrorBody
        if (typeof body.error === "string") return { message: body.error, code: body.code }
        if (body.error && typeof body.error === "object") {
            return { message: body.error.message ?? fallback, code: body.error.code }
        }
        return { message: body.message ?? fallback, code: body.code }
    } catch {
        return { message: response.statusText || fallback }
    }
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init)
    if (!response.ok) {
        const error = await readError(response)
        throw new ApiError(error.message, response.status, error.code)
    }
    return response.json() as Promise<T>
}

export async function apiCommand(input: RequestInfo | URL, init?: RequestInit): Promise<void> {
    const response = await fetch(input, init)
    if (!response.ok) {
        const error = await readError(response)
        throw new ApiError(error.message, response.status, error.code)
    }
}
