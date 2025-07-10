"use client"

import React from "react"
import {WidgetProps, WidgetTemplate} from "@/components/widgets/base/WidgetTemplate"
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
import {useSettingsStore} from "@/store/settingsStore"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"

const WeatherWidget: React.FC<WidgetProps> = ({id, editMode, onWidgetDelete, isPlaceholder}) => {
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

    if (isPlaceholder) {
        const data = [
            { time: '2025-05-02T11:00', temperature: 26.4, weathercode: 0 },
            { time: '2025-05-02T12:00', temperature: 27.2, weathercode: 2 },
            { time: '2025-05-02T13:00', temperature: 27.5, weathercode: 3 },
            { time: '2025-05-02T14:00', temperature: 27.0, weathercode: 2 },
            { time: '2025-05-02T15:00', temperature: 27.0, weathercode: 3 }
        ]

        return (
            <WidgetTemplate id={id} className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetHeader title={"Weather"}/>
                <div className={"h-min flex flex-col justify-between gap-2"}>
                    <div className={"h-full flex items-center gap-2 rounded-md bg-info/5 border border-info/20 px-2 py-1"}>
                        <div className={"text-primary"}>
                            <Sun size={28}/>
                        </div>
                        <p className={"text-lg text-primary font-semibold"}>25°C</p>
                    </div>
                    <div className={"flex items-center gap-2 justify-between"}>
                        <div className={"h-full w-full flex items-center justify-between px-4"}>
                            {data?.map((weather: any) =>
                                <div className={"flex flex-col items-center gap-1"} key={weather.time}>
                                    <p className={"text-xs text-tertiary"}>{formatDate(weather.time, "hh aa")}</p>
                                    {getWeatherIcon(weather.weathercode)}
                                    <p className={"text-primary"}>{`${Number(weather.temperature.toFixed(0))}°C`}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </WidgetTemplate>
        )
    }

    const {currentWeather, nextWeather, location, isLoading, isError, geolocationError} = useWeather()
    const {settings} = useSettingsStore()

    if (isLoading) {
        return (
            <WidgetTemplate
                id={id}
                className={"col-span-1 row-span-1 h-full flex flex-col justify-between gap-4"}
                name={"weather"}
                editMode={editMode}
                onWidgetDelete={onWidgetDelete}
            >
                <Skeleton className={"w-full h-14"} />
                <div className={"h-full w-full flex items-center gap-4 px-4"}>
                    <Skeleton className={"h-16 w-1/5"}/>
                    <Skeleton className={"h-16 w-1/5"}/>
                    <Skeleton className={"h-16 w-1/5"}/>
                    <Skeleton className={"h-16 w-1/5"}/>
                    <Skeleton className={"h-16 w-1/5"}/>
                </div>
            </WidgetTemplate>
        )
    }

    if (isError) {
        return (
            <WidgetTemplate id={id} className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError message={"An error occurred, while getting the weather data. Try again later."}/>
            </WidgetTemplate>
        )
    }

    if (geolocationError) {
        return (
            <WidgetTemplate id={id} className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                <WidgetError message={"Please enable your geolocation info."}/>
            </WidgetTemplate>
        )
    }
    
    return (
        <WidgetTemplate id={id} className={"col-span-1 row-span-1"} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
           <WidgetHeader title={"Weather"}>
               <div
                   data-state={location ? "true" : "false"}
                   className={"w-full flex gap-1 items-center justify-end text-sm text-tertiary data-[state=false]:hidden"}
               >
                   <MapPinned size={14}/>
                   <p className={"font-mono"}>{location}</p>
               </div>
           </WidgetHeader>
            <div className={"h-full flex flex-col justify-between gap-2"}>
                <div className={"h-min flex items-center gap-2 rounded-md bg-info/5 border border-info/20 px-2 py-1"}>
                    <div className={"text-primary"}>
                        {getWeatherIcon(currentWeather?.weathercode, 28)}
                    </div>
                    <p className={"text-lg text-primary font-semibold"}>{`${currentWeather?.temperature}°C`}</p>
                </div>
                <div className={"flex items-center gap-2 justify-between"}>
                    <div className={"h-full w-full flex items-center justify-between px-2"}>
                        {nextWeather?.map((weather: any) =>
                            <div className={"flex flex-col items-center gap-1"} key={weather.time}>
                                <p className={"text-xs text-tertiary"}>{formatDate(weather.time, settings?.config.hourFormat === "24" ?  "HH:00" : "h a")}</p>
                                {getWeatherIcon(weather.weathercode)}
                                <p className={"text-primary"}>{`${Number(weather.temperature.toFixed(0))}°C`}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WidgetTemplate>
    )
}

export {WeatherWidget}