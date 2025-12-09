"use client"

import React, {useCallback} from "react"
import {useEffect, useState} from "react"
import {WidgetContent} from "@/components/widgets/base/WidgetContent"
import {WidgetHeader} from "@/components/widgets/base/WidgetHeader"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/Select"
import {useSettings} from "@/hooks/data/useSettings"
import { defineWidget, WidgetProps } from "@forge/sdk"

interface ClockConfig {
    timezone: string
}

const ClockWidget: React.FC<WidgetProps<ClockConfig>> = ({widget, config, updateConfig}) => {
    const {settings} = useSettings(widget?.userId)

    const timezones = [
        { value: "Europe/Berlin", label: "Berlin (MEZ/MESZ)" },
        { value: "Europe/London", label: "London (GMT/BST)" },
        { value: "Europe/Paris", label: "Paris (MEZ/MESZ)" },
        { value: "America/New_York", label: "New York (EST/EDT)" },
        { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
        { value: "Asia/Tokyo", label: "Tokyo (JST)" },
        { value: "Asia/Shanghai", label: "Shanghai (CST)" },
        { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
        { value: "UTC", label: "UTC " },
    ]
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date, timezone: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: settings?.config?.hourFormat === "12",
        }).format(date)
    }

    const formatDate = (date: Date, timezone: string) => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: timezone,
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

    const handleSave = useCallback(async (updatedTimezone: string) => {
        await updateConfig({ timezone: updatedTimezone })
    }, [updateConfig])

    return (
        <>
            <WidgetHeader title={"Clock"}>
                <Select value={config.timezone} onValueChange={(value) => handleSave(value)}>
                    <SelectTrigger className="w-max h-6 shadow-none dark:shadow-none border-0 bg-tertiary data-[state=open]:bg-inverted/10 data-[state=open]:text-primary">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={"border-main/40"} >
                        {timezones.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                                <span>{timezone.label}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </WidgetHeader>
            <WidgetContent className={"flex flex-col items-center justify-center"}>
                <div className="text-5xl font-mono text-primary font-bold tracking-wider">
                    {formatTime(currentTime, config.timezone)}
                </div>
                <div className="text-tertiary">
                    {formatDate(currentTime, config.timezone)}
                </div>
            </WidgetContent>
        </>
    )
}

export const clockWidgetDefinition = defineWidget({
    name: "Clock",
    component: ClockWidget,
    preview: {
        description: 'Beautiful clock to display your current time',
        image: '/github_preview.svg',
        tags: ["productivity"],
        sizes: {
            desktop: { width: 1, height: 1 },
            tablet: { width: 1, height: 1 },
            mobile: { width: 1, height: 1 }
        }
    },
    defaultConfig: {
        timezone: "Europe/Berlin",
    },
})

