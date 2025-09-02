"use server"

export async function fetchCalendarList(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!res.ok) throw new Error('Failed to fetch calendar list')

    const data = await res.json()
    return data.items
}

export async function fetchCalendarEvents(accessToken: string, calendarId: string) {
    const params = new URLSearchParams({
        maxResults: "1000",
        orderBy: "updated"
    })

    const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` }}
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.items
}

export async function refreshToken(refreshToken: string) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    })

    if (!res.ok) throw new Error("Failed to refresh Google access token")

    const data = await res.json()

    return {
        access_token: data.access_token,
        expires_in: data.expires_in || 3600,
        id_token: data.id_token || null
    }
}