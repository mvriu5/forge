import { fetchReverseGeocoding, fetchWeatherData } from "@/actions/weather";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react"

export const useWeather = () => {
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
    const [geolocationError, setGeolocationError] = useState(false)

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setGeolocationError(true)
            return
        }

        navigator.geolocation.getCurrentPosition((position) => {
            setCoords({lat: position.coords.latitude, lon: position.coords.longitude})
        }, () => setGeolocationError(true))
    }, [])

    const isGeoLoading = coords === null && !geolocationError

    const { data: locationData } = useQuery({
        queryKey: ["reverse-geocoding", coords],
        queryFn: async () => await fetchReverseGeocoding(coords!.lat, coords!.lon),
        enabled: !!coords
    })

    const location = locationData?.address?.town ?? null

    const { data: weatherData, isLoading: isWeatherLoading, isError } = useQuery({
        queryKey: ["weather", coords],
        queryFn: async () => await fetchWeatherData(coords!.lat, coords!.lon),
        enabled: !!coords,
        refetchInterval: 15 * 60 * 1000 // 15 minutes
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
        for (let i = currentIndex + 1; i < Math.min(currentIndex + 6, time.length); i++) {
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
