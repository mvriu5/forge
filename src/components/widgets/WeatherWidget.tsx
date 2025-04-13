"use client"

import React from "react"
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
    Sun,
    TriangleAlert
} from "lucide-react"
import {formatDate} from "date-fns"
import {Callout} from "@/components/ui/Callout"
import {Skeleton} from "@/components/ui/Skeleton"
import {useWeather} from "@/hooks/useWeather"

interface WeatherWidgetProps {
    editMode: boolean
    onWidgetDelete: (id: string) => void
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({editMode, onWidgetDelete}) => {
    const {currentWeather, nextWeather, location, loading, error} = useWeather()

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

    if (error) {
        return (
            <WidgetTemplate className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <Callout variant="error" className={"flex items-center gap-2 border border-error/40"}>
                    <TriangleAlert size={32}/>
                    An error occurred, while getting the weather data. Try again later.
                </Callout>
            </WidgetTemplate>
        )
    }
    
    return (
        <WidgetTemplate className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>

            <div className={"h-full flex flex-col justify-between gap-4"}>
                {loading ? (
                    <Skeleton className={"w-full h-14"} />
                    ) : (
                    <div className={"h-full flex items-center gap-2 rounded-md bg-info/5 border border-info/20 px-2 h-10"}>
                        <div className={"text-primary"}>
                            {getWeatherIcon(currentWeather?.weathercode, 28)}
                        </div>
                        <p className={"text-lg text-primary font-semibold"}>{`${currentWeather?.temperature}°C`}</p>
                        <div
                            data-state={location ? "true" : "false"}
                            className={"w-full flex gap-1 items-center justify-end text-sm text-tertiary data-[state=false]:hidden"}
                        >
                            <MapPinned size={14}/>
                            <p className={"font-mono"}>{location}</p>
                        </div>
                    </div>
                )}


                <div className={"flex items-center gap-2 justify-between"}>
                    {loading ? (
                        <div className={"h-full w-full flex items-center gap-4 px-4"}>
                            <Skeleton className={"h-16 w-1/5"}/>
                            <Skeleton className={"h-16 w-1/5"}/>
                            <Skeleton className={"h-16 w-1/5"}/>
                            <Skeleton className={"h-16 w-1/5"}/>
                            <Skeleton className={"h-16 w-1/5"}/>
                        </div>
                        ) : (
                        <div className={" h-full w-full flex items-center justify-between px-4"}>
                            {nextWeather?.map((weather: any) =>
                                <div className={"flex flex-col items-center gap-1"} key={weather.time}>
                                    <p className={"text-xs text-tertiary"}>{formatDate(weather.time, "hh aa")}</p>
                                    {getWeatherIcon(weather.weathercode)}
                                    <p className={"text-primary"}>{`${Number(weather.temperature.toFixed(0))}°C`}</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </WidgetTemplate>
    )
}

export {WeatherWidget}