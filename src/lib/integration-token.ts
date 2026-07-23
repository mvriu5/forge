import { auth } from "@/lib/auth"

export async function getIntegrationAccessToken(
    providerId: string,
    userId: string,
    requestHeaders: Headers,
): Promise<string | null> {
    try {
        const token = await auth.api.getAccessToken({
            headers: requestHeaders,
            body: { providerId, userId },
        })
        return token.accessToken
    } catch {
        return null
    }
}
