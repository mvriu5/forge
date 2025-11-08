"use client"

import React, {useCallback} from "react"
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
    Sun
} from "lucide-react"
import {formatDate} from "date-fns"
import {Skeleton} from "@/components/ui/Skeleton"
import {useWeather} from "@/hooks/useWeather"
import {WidgetError} from "@/components/widgets/base/WidgetError"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {useSettings} from "@/hooks/data/useSettings"

const WeatherWidget: React.FC<WidgetProps> = ({id, widget, editMode, onWidgetDelete}) => {
    if (!widget) return null
    const {currentWeather, nextWeather, location, isLoading, isError, geolocationError} = useWeather()
    const {settings} = useSettings(widget.userId)
    if (!settings) return null

    const getWeatherIcon = useCallback((code: number, size = 16) => {
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
    }, [])


    if (isError || geolocationError) {
        return (
            <WidgetTemplate id={id} widget={widget} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
                {isError ? (
                    <WidgetError message={"An error occurred, while getting the weather data. Try again later."}/>
                ) : (
                    <WidgetError message={"Please enable your geolocation info."}/>
                )}
            </WidgetTemplate>
        )
    }

    return (
        <WidgetTemplate id={id} widget={widget} name={"weather"} editMode={editMode} onWidgetDelete={onWidgetDelete}>
            <WidgetHeader title={"Weather"}>
               <div
                   data-state={location ? "true" : "false"}
                   className={"w-full flex gap-1 items-center justify-end text-sm text-tertiary data-[state=false]:hidden"}
               >
                   <MapPinned size={14}/>
                   <p className={"font-mono"}>{location}</p>
               </div>
           </WidgetHeader>
            <div className={"h-full grid grid-cols-4 grid-rows-2 gap-1"}>
                {isLoading ? (
                    <>
                        {[...Array(8)].map((_, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <div className={"flex items-center justify-center"} key={index}>
                                <Skeleton className={"h-12 w-16 rounded-md"}/>
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
                                    {formatDate(weather.time, settings?.config.hourFormat === "24" ?  "HH:00" : "h a")}
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
        </WidgetTemplate>
    )
}

export {WeatherWidget}