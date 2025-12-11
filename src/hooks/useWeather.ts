import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react"

const GEOCODING_QUERY_KEY = (coords: { lat: number, lon: number } | null) => ["reverse-geocoding", coords] as const
const WEATHER_QUERY_KEY = (coords: { lat: number, lon: number} | null) => ["weather", coords] as const

const GEO_COORDS_STORAGE_KEY = "weatherWidgetCoords"
const GEO_PERMISSION_STORAGE_KEY = "weatherWidgetPermission"

const USER_AGENT_HEADER = {"User-Agent": "Forge (tryforge.io)"}

const fetchReverseGeocoding = async (lat: number, lon: number) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: USER_AGENT_HEADER,
    })

    if (!res.ok) throw new Error("Reverse-Geocoding Fehler")
    return res.json()
}

const fetchWeatherData = async (lat: number, lon: number) => {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode`)

    if (!res.ok) throw new Error("Wetterdaten-Fehler")
    return res.json()
}

export const useWeather = () => {
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
    const [geolocationError, setGeolocationError] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const storedCoords = window.localStorage.getItem(GEO_COORDS_STORAGE_KEY)
        if (storedCoords) {
            try {
                const parsed = JSON.parse(storedCoords) as { lat?: number; lon?: number }
                if (typeof parsed?.lat === "number" && typeof parsed?.lon === "number") {
                    setCoords({ lat: parsed.lat, lon: parsed.lon })
                    return
                }
            } catch {
                // ignore invalid stored data
            }
        }

        const storedPermission = window.localStorage.getItem(GEO_PERMISSION_STORAGE_KEY)
        if (storedPermission === "denied") {
            setGeolocationError(true)
            return
        }

        if (!("geolocation" in navigator)) {
            setGeolocationError(true)
            return
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const newCoords = { lat: position.coords.latitude, lon: position.coords.longitude }
            setCoords(newCoords)
            try {
                window.localStorage.setItem(GEO_COORDS_STORAGE_KEY, JSON.stringify(newCoords))
                window.localStorage.removeItem(GEO_PERMISSION_STORAGE_KEY)
            } catch {
                // ignore storage errors
            }
        }, () => {
            setGeolocationError(true)
            try {
                window.localStorage.setItem(GEO_PERMISSION_STORAGE_KEY, "denied")
            } catch {
                // ignore storage errors
            }
        })
    }, [])

    const isGeoLoading = coords === null && !geolocationError

    const { data: locationData } = useQuery({
        queryKey: GEOCODING_QUERY_KEY(coords),
        queryFn: () => fetchReverseGeocoding(coords!.lat, coords!.lon),
        enabled: !!coords,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })

    const location = locationData?.address?.town ?? null

    const { data: weatherData, isLoading: isWeatherLoading, isError } = useQuery({
        queryKey: WEATHER_QUERY_KEY(coords),
        queryFn: () => fetchWeatherData(coords!.lat, coords!.lon),
        enabled: !!coords,
        staleTime: 15 * 60 * 1000, // 15 minutes
        refetchInterval: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })


    const currentWeather = (() => {
        if (!weatherData) return null
        const now = new Date()
        const { time, temperature_2m, weathercode } = weatherData.hourly

        const index = time.findLastIndex((t: string) => new Date(t) <= now)
        if (index === -1) return null

        return {
            time: time[index],
            temperature: temperature_2m[index],
            weathercode: weathercode[index]
        }
    })()

    const nextWeather = (() => {
        if (!weatherData) return null
        const now = new Date()
        const { time, temperature_2m, weathercode } = weatherData.hourly

        const currentIndex = time.findLastIndex((t: string) => new Date(t) <= now)
        if (currentIndex === -1) return null

        const result = []
        for (let i = currentIndex + 1; i < Math.min(currentIndex + 8, time.length); i++) {
            result.push({
                time: time[i],
                temperature: temperature_2m[i],
                weathercode: weathercode[i]
            })
        }
        return result
    })()


    return {
        location,
        currentWeather,
        nextWeather,
        isLoading: isGeoLoading || isWeatherLoading,
        isError,
        geolocationError
    }
}
