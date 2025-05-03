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
    const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        headers: { Authorization: `Bearer ${accessToken}` }}
    )
    if (!res.ok) return []

    const data = await res.json()
    return data.items
}