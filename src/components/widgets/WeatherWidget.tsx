"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudHail,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    MapPinned,
    Sun
} from "lucide-react"
import { Skeleton } from "@/components/ui/Skeleton"
import { WidgetError } from "@/components/widgets/base/WidgetError"
import { WidgetHeader } from "@/components/widgets/base/WidgetHeader"
import { useSettings } from "@/hooks/data/useSettings"
import { defineWidget } from "@/lib/widget"
import { WidgetProps } from "@/lib/definitions"
import { formatWeatherHour } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"

const GEOCODING_QUERY_KEY = (coords: { lat: number, lon: number } | null) => ["reverse-geocoding", coords] as const
const WEATHER_QUERY_KEY = (coords: { lat: number, lon: number } | null) => ["weather", coords] as const

const GEO_COORDS_STORAGE_KEY = "weatherWidgetCoords"
const GEO_PERMISSION_STORAGE_KEY = "weatherWidgetPermission"

const USER_AGENT_HEADER = { "User-Agent": "Forge (tryforge.io)" }

const fetchReverseGeocoding = async (lat: number, lon: number) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: USER_AGENT_HEADER,
    })

    if (!res.ok) throw new Error("Reverse-Geocoding Fehler")
    return res.json()
}

const fetchWeatherData = async (lat: number, lon: number) => {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode`)

    if (!res.ok) throw new Error("Weatherdata-Error")
    return res.json()
}


const SKELETON_COUNT = 8;
const skeletonKeys = Array.from({ length: SKELETON_COUNT }, (_, i) => `sk-${i}`);

const WeatherWidget: React.FC<WidgetProps> = ({ widget }) => {
    const { settings } = useSettings(widget.userId)

    // from useWeather hook
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

    const isLoading = isGeoLoading || isWeatherLoading;

    const getWeatherIcon = useCallback((code: number, size = 16) => {
        switch (code) {
            case 0: return <Sun size={size} />
            case 1: case 2: case 3: return <CloudSun size={size} />
            case 45: case 48: return <CloudFog size={size} />
            case 51: case 53: case 55: return <CloudDrizzle size={size} />
            case 56: case 57: return <CloudDrizzle size={size} />
            case 61: case 63: case 65: return <CloudRain size={size} />
            case 66: case 67: return <CloudRain size={size} />
            case 71: case 73: case 75: case 77: return <CloudSnow size={size} />
            case 80: case 81: case 82: return <CloudRain size={size} />
            case 85: case 86: return <CloudSnow size={size} />
            case 95: return <CloudLightning size={size} />
            case 96: case 99: return <CloudHail size={size} />
            default: return <Cloud size={size} />
        }
    }, [])

    if (isError || geolocationError) {
        return (
            <WidgetError message={
                isError
                    ? "An error occurred, while getting the weather data. Try again later."
                    : "Please enable your geolocation info."
            } />
        )
    }

    return (
        <>
            <WidgetHeader title={"Weather"}>
                <div
                    data-state={location ? "true" : "false"}
                    className={"w-full flex gap-1 items-center justify-end text-sm text-tertiary data-[state=false]:hidden"}
                >
                    <MapPinned size={14} />
                    <p className={"font-mono"}>{location}</p>
                </div>
            </WidgetHeader>
            <div className={"h-full grid grid-cols-4 grid-rows-2 gap-1"}>
                {isLoading ? (
                    <>
                        {skeletonKeys.map((key) => (
                            <div className={"flex items-center justify-center"} key={key}>
                                <Skeleton className={"h-12 w-16 rounded-md"} />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className={"h-full flex flex-col justify-center items-center gap-1 rounded-md bg-info/10 border border-info/20 px-2 py-1"}>
                            <div className={"text-info/80"}>
                                {getWeatherIcon(currentWeather?.weathercode, 24)}
                            </div>
                            <p className={"text-info/80 font-semibold"}>{`${currentWeather?.temperature}°C`}</p>
                        </div>
                        {nextWeather?.map((weather: any) =>
                            <div className={"h-full flex flex-col items-center justify-center"} key={weather.time}>
                                <p className={"text-xs font-medium text-tertiary"}>
                                    {formatWeatherHour(weather.time, settings?.config.hourFormat ?? "24")}
                                </p>
                                <p className={"flex items-center gap-1 text-secondary font-medium"}>
                                    {getWeatherIcon(weather.weathercode)}
                                    {`${Number(weather.temperature.toFixed(0))}°C`}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export const weatherWidgetDefinition = defineWidget({
    name: "Weather",
    component: WeatherWidget,
    description: 'See the weather in your location',
    image: "/weather_preview.svg",
    tags: ["weather"],
    sizes: {
        desktop: { width: 1, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    }
})
