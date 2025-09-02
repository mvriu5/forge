"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "../components/Popover"
import {Button} from "../components/Button"
import {Calendar} from "../components/Calendar"
import {useState} from "react"
import {DateRange} from "react-day-picker"

interface DatePickerProps {
    title: string
    value?: Date
    mode?: "single" | "range" | "multiple"
    className?: string
    onSelect?: (date: Date | DateRange | Date[]) => void
}

function DatePicker({ value, title, onSelect, mode = "single", className }: DatePickerProps) {
    const [date, setDate] = useState<Date | DateRange | Date[] | undefined>(value ?? undefined)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    data-state={isOpen ? "open" : "closed"}
                    variant={"default"}
                    className={cn(
                        "gap-2 text-sm justify-start text-left font-normal hover:text-secondary",
                        "data-[state=open]:bg-inverted/10 data-[state=open]:text-primary",
                        className
                    )}
                >
                    <CalendarIcon size={14}/>
                    {!date && <span>{title}</span>}
                    {date && mode === "single" && format(date as Date, "PPP")}
                    {date && mode === "multiple" && `${(date as Date[]).length} Date's selected`}
                    {date && mode === "range" && `${format((date as DateRange).from as Date, "PP")} - ${format((date as DateRange).to as Date, "PP")}`}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="start">
                {mode === "single" &&
                    <Calendar
                        mode={mode}
                        selected={date as Date}
                        onSelect={(date) => {
                            setDate(date)
                            setIsOpen(false)
                            if (onSelect) onSelect(date)
                        }}
                        autoFocus
                        required
                    />
                }
                {mode === "multiple" &&
                    <Calendar
                        mode={mode}
                        selected={date as Date[]}
                        onSelect={(date) => {
                            setDate(date)
                            if (onSelect) onSelect(date ?? [])
                        }}
                        autoFocus
                    />
                }
                {mode === "range" &&
                    <Calendar
                        mode={mode}
                        selected={date as DateRange}
                        onSelect={(date) => {
                            setDate(date)
                            if (onSelect) onSelect(date ?? { from: undefined, to: undefined })
                        }}
                        autoFocus
                    />
                }

            </PopoverContent>
        </Popover>
    )
}

export { DatePicker }