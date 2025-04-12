"use client"

import React, {useState} from "react"
import {WidgetTemplate} from "@/components/widgets/WidgetTemplate"
import { useEffect } from "react"
import {
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudHail,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Sun
} from "lucide-react"

interface WeatherWidgetProps {
    editMode: boolean
    onWidgetDelete: (id: string) => void
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({editMode, onWidgetDelete}) => {
    const [weatherData, setWeatherData] = useState<any>(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode`

                    fetch(apiUrl)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Netzwerkantwort war nicht ok')
                            }
                            return response.json()
                        })
                        .then((data) => {
                            setWeatherData(data.current_weather)
                            setLoading(false)
                        })
                        .catch((err) => {
                            setError(err.message)
                            setLoading(false)
                        })
                },
                (err) => {
                    setError(true)
                    setLoading(false)
                }
            )
        } else {
            setError(true)
            setLoading(false)
        }
    }, [])

    if (loading) {
        return <div>Lade Wetterdaten...</div>
    }

    if (error || !weatherData) {
        return <div>Fehler</div>
    }

    const getWeatherIcon = (code: number) => {
        switch (code) {
            case 0: return <Sun />
            case 1 | 2 | 3: return <CloudSun/>
            case 45 | 48: return <CloudFog />
            case 51 | 53 | 55: return <CloudDrizzle />
            case 56 | 57: return <CloudDrizzle />
            case 61 | 63 | 65: return <CloudRain />
            case 66 | 67: return <CloudRain />
            case 71 | 73 |75 | 77: return <CloudSnow />
            case 80 | 81 | 82: return <CloudRain />
            case 85 | 86: return <CloudSnow />
            case 95: return <CloudLightning />
            case 96 | 99: return <CloudHail />
            default: return <Cloud/>
        }
    }
    
    return (
        <WidgetTemplate className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>


            <div>
                <h2>Aktuelles Wetter</h2>
                <p>Temperatur: {weatherData.temperature}°C</p>
                <p>Code: {weatherData.weathercode}</p>
                <p>Zeit: {weatherData.time}</p>
            </div>
        </WidgetTemplate>
    )
}

export {WeatherWidget}