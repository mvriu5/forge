"use server"

export const fetchReverseGeocoding = async (lat: number, lon: number) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: {"User-Agent": "Forge (tryforge.io)"}
    })

    if (!res.ok) throw new Error("Reverse-Geocoding Fehler")
    return res.json()
}

export const fetchWeatherData = async (lat: number, lon: number) => {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode`)

    if (!res.ok) throw new Error("Wetterdaten-Fehler")
    return res.json()
}