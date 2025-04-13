import { useEffect, useState } from "react"

export const useWeather = () => {
    const [weatherData, setWeatherData] = useState<any>(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentWeather, setCurrentWeather] = useState<any>(null)
    const [nextWeather, setNextWeather] = useState<any>(null)
    const [location, setLocation] = useState<string | null>(null)

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setError(true)
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords

            const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            fetch(reverseUrl, { headers: { 'User-Agent': 'Forge (tryforge.io)' } })
                .then((response) => {
                    if (!response.ok) throw new Error('Reverse-Geocoding Fehler')
                    return response.json()
                })
                .then((data) => {
                    setLocation(data.address?.town ?? null)
                })
                .catch(() => {
                    setLocation(null)
                })

            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode`
            fetch(apiUrl)
                .then((response) => {
                    if (!response.ok) throw new Error('Netzwerkantwort war nicht ok')
                    return response.json()
                })
                .then((data) => {
                    setWeatherData(data)
                    setLoading(false)
                })
                .catch(() => {
                    setError(true)
                    setLoading(false)
                })
        }, () => {
            setError(true)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (!weatherData) return
        getCurrentHour()
        getNext5Hours()
    }, [weatherData])

    const getCurrentHour = () => {
        const now = new Date()
        const { time, temperature_2m, weathercode } = weatherData.hourly

        const validIndices = time.reduce((indices: any[], timeStr: string | number | Date, index: any) => {
            if (new Date(timeStr) <= now) indices.push(index)
            return indices
        }, [])

        if (validIndices.length <= 0) {
            setCurrentWeather(null)
            return
        }

        const lastIndex = validIndices[validIndices.length - 1]
        setCurrentWeather({
            time: time[lastIndex],
            temperature: temperature_2m[lastIndex],
            weathercode: weathercode[lastIndex]
        })
    }

    const getNext5Hours = () => {
        const now = new Date()
        const { time, temperature_2m, weathercode } = weatherData.hourly

        let lastIndex = -1
        for (let i = 0; i < time.length; i++) {
            if (new Date(time[i]) <= now) lastIndex = i
        }

        if (lastIndex !== -1 && lastIndex < time.length - 1) {
            const nextHours = []
            for (let i = lastIndex + 1; i < Math.min(lastIndex + 6, time.length); i++) {
                nextHours.push({
                    time: time[i],
                    temperature: temperature_2m[i],
                    weathercode: weathercode[i]
                })
            }
            setNextWeather(nextHours)
        } else {
            setNextWeather(null)
        }
    }

    return {
        currentWeather,
        nextWeather,
        location,
        loading,
        error
    }
}
