"use client"

import React, {useEffect, useState} from "react"
import {WidgetTemplate} from "@/components/widgets/WidgetTemplate"
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
import { formatDate } from "date-fns"

interface WeatherWidgetProps {
    editMode: boolean
    onWidgetDelete: (id: string) => void
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({editMode, onWidgetDelete}) => {
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
            fetch(reverseUrl, {headers: {'User-Agent': 'Forge (tryforge.io)'}})
                .then((response) => {
                    if (!response.ok) throw new Error('Reverse-Geocoding Fehler')
                    return response.json()
                })
                .then((data) => {
                    setLocation(data.address?.town ?? null)
                })
                .catch((err) => {
                    console.error("Reverse-Geocoding Fehler: ", err.message)
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
                .catch((err) => {
                    setError(true)
                    setLoading(false)
                    console.log(err.message)
                })
        }, () => {
            setError(true)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (weatherData) {
            getCurrentHour()
            getNext5Hours()
            console.log(currentWeather)
            console.log(nextWeather)
        }
    }, [weatherData]);

    if (loading) {
        return <div>Lade Wetterdaten...</div>
    }

    if (error || !weatherData) {
        return <div>Fehler</div>
    }

    const getCurrentHour = () => {
        const now = new Date();
        const { time, temperature_2m, weathercode } = weatherData.hourly;

        // Finde alle Indizes, deren Zeitwert in der Vergangenheit liegt
        const validIndices = time.reduce((indices: any[], timeStr: string | number | Date, index: any) => {
            if (new Date(timeStr) <= now) {
                indices.push(index);
            }
            return indices;
        }, []);

        if (validIndices.length > 0) {
            const lastIndex = validIndices[validIndices.length - 1];
            // Erstelle ein Objekt mit den zugehörigen Daten
            const currentHourData = {
                time: time[lastIndex],
                temperature: temperature_2m[lastIndex],
                weathercode: weathercode[lastIndex],
                // Füge ggf. weitere Parameter hinzu
            };
            setCurrentWeather(currentHourData);
        } else {
            setCurrentWeather(null);
        }
    };

    const getNext5Hours = () => {
        const now = new Date();
        const { time, temperature_2m, weathercode } = weatherData.hourly;

        // Finde den Index der letzten vergangenen Stunde
        let lastIndex = -1;
        for (let i = 0; i < time.length; i++) {
            if (new Date(time[i]) <= now) {
                lastIndex = i;
            }
        }

        if (lastIndex !== -1 && lastIndex < time.length - 1) {
            // Erstelle ein Array von Objekten für die nächsten 5 Stunden
            const nextHours = [];
            // Begrenze die Schleife an die Länge des Arrays, falls weniger als 5 weitere Stunden vorhanden sind
            for (let i = lastIndex + 1; i < Math.min(lastIndex + 6, time.length); i++) {
                nextHours.push({
                    time: time[i],
                    temperature: temperature_2m[i],
                    weathercode: weathercode[i],
                    // Füge ggf. weitere Parameter hinzu
                });
            }
            setNextWeather(nextHours);
        } else {
            setNextWeather(null);
        }
    };

    const getWeatherIcon = (code: number, size = 24) => {
        switch (code) {
            case 0: return <Sun size={size}/>
            case 1 | 2 | 3: return <CloudSun size={size}/>
            case 45 | 48: return <CloudFog size={size}/>
            case 51 | 53 | 55: return <CloudDrizzle size={size}/>
            case 56 | 57: return <CloudDrizzle size={size}/>
            case 61 | 63 | 65: return <CloudRain size={size}/>
            case 66 | 67: return <CloudRain size={size}/>
            case 71 | 73 |75 | 77: return <CloudSnow size={size}/>
            case 80 | 81 | 82: return <CloudRain size={size}/>
            case 85 | 86: return <CloudSnow size={size}/>
            case 95: return <CloudLightning size={size}/>
            case 96 | 99: return <CloudHail size={size}/>
            default: return <Cloud size={size}/>
        }
    }
    
    return (
        <WidgetTemplate className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>

            <div className={"flex flex-col justify-between gap-2"}>

                <div className={"flex items-center gap-2 rounded-md bg-info/5 border border-info/20 px-2 h-10"}>
                    <div className={"text-primary"}>
                        {getWeatherIcon(currentWeather?.weathercode, 28)}
                    </div>

                    <p className={"text-lg text-primary font-semibold"}>{`${currentWeather?.temperature}°C`}</p>
                    <div className={"w-full flex gap-1 items-center justify-end text-sm text-tertiary"}>
                        <MapPinned size={14}/>
                        <p className={"font-mono"}>{location}</p>
                    </div>
                </div>

                <div className={"flex items-center gap-2 justify-between"}>
                    {nextWeather?.map((weather: any) =>
                        <div className={"flex flex-col items-center gap-1"} key={weather.time}>
                            <p className={"text-xs text-tertiary"}>{formatDate(weather.time, "hh aa")}</p>
                            {getWeatherIcon(weather.weathercode)}
                            <p className={"text-primary"}>{`${Number(weather.temperature.toFixed(0))}°C`}</p>
                        </div>
                    )}
                </div>

            </div>
        </WidgetTemplate>
    )
}

export {WeatherWidget}