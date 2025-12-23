"use client"

import React, {useEffect, useState} from "react"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {useSettings} from "@/hooks/data/useSettings"
import {defineWidget, WidgetProps} from "@tryforgeio/sdk"

const ClockWidget: React.FC<WidgetProps> = ({widget}) => {
    const {settings} = useSettings(widget?.userId)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: settings?.config?.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: settings?.config?.hourFormat === "12",
        }).format(date)
    }

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: settings?.config?.timezone,
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }

        const formatter = new Intl.DateTimeFormat("en-US", options)
        const parts = formatter.formatToParts(date)

        const weekday = parts.find((part) => part.type === "weekday")?.value || ""
        const month = parts.find((part) => part.type === "month")?.value || ""
        const day = parts.find((part) => part.type === "day")?.value || ""
        const year = parts.find((part) => part.type === "year")?.value || ""

        const dayNum = Number.parseInt(day)
        const getOrdinalSuffix = (n: number) => {
            const s = ["th", "st", "nd", "rd"]
            const v = n % 100
            return s[(v - 20) % 10] || s[v] || s[0]
        }

        return `${weekday}, ${month} ${day}${getOrdinalSuffix(dayNum)} ${year}`
    }

    return (
        <>
            <WidgetContent className={"flex flex-col items-center justify-center"}>
                <p className="text-5xl font-mono text-primary font-bold tracking-wider">{formatTime(currentTime)}</p>
                <p className={"text-tertiary"}>{formatDate(currentTime)}</p>
            </WidgetContent>
        </>
    )
}

export const clockWidgetDefinition = defineWidget({
    name: "Clock",
    component: ClockWidget,
    description: 'Beautiful clock to display your current time',
    image: '/github_preview.svg',
    tags: ["productivity"],
    sizes: {
        desktop: { width: 1, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    }
})
