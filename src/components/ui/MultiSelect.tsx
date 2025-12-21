"use client"

import { Checkbox } from "@/components/ui/Checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { cn, CONTAINER_STYLES } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import * as React from "react"
import { forwardRef, useCallback, useMemo, useState } from "react"

interface MultiSelectOption {
    value: string
    label: string
    description?: string
    disabled?: boolean
}

interface MultiSelectProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverTrigger>, "value" | "onValueChange" | "children"> {
    options: MultiSelectOption[]
    value?: string[]
    onValueChange: (value: string[]) => void
    displayValue: string
    placeholder?: string
    contentClassName?: string
    disabled?: boolean
}

const triggerStyles = cn(
    "group flex h-8 w-42 items-center justify-between gap-2 rounded-md border border-main/60 bg-secondary px-2 py-1 text-sm",
    "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 focus:outline-0 shadow-xs dark:shadow-md"
)

const MultiSelect = forwardRef<React.ComponentRef<"button">, MultiSelectProps>(({options, value, onValueChange, placeholder = "Select options", displayValue, className, contentClassName, disabled = false, ...props}, ref) => {
    const [open, setOpen] = useState(false)

    const selectedValues = value ?? []

    const toggleValue = useCallback((nextValue: string, nextChecked?: boolean) => {
        const shouldCheck =
            typeof nextChecked === "boolean"
                ? nextChecked
                : !selectedValues.includes(nextValue)

        onValueChange(
            shouldCheck
                ? [...selectedValues, nextValue]
                : selectedValues.filter((item) => item !== nextValue)
        )
    }, [onValueChange, selectedValues])

    const selectedLabels = useMemo(() => (
        options
            .filter((option) => selectedValues?.includes(option.value))
            .map((option) => option.label)
    ), [options, selectedValues])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled} {...props}>
                <button
                    ref={ref}
                    type="button"
                    aria-expanded={open}
                    className={cn(triggerStyles, className, disabled && "cursor-not-allowed opacity-50")}
                >
                    <span className={cn(!selectedLabels.length && "text-tertiary")}>{selectedLabels.length >= 0 ? displayValue : placeholder}</span>
                    <ChevronDown size={14} className={cn("text-tertiary transition-all mt-0.5", open && "rotate-180")}/>
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={4}
                className={cn(
                    "p-0 min-w-42 w-(--radix-select-trigger-width) max-w-[18rem] border border-main/40",
                    "bg-primary text-secondary shadow-[10px_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.5)]",
                    "max-h-72 overflow-hidden data-[side=bottom]:slide-in-from-top-2",
                    CONTAINER_STYLES.animation,
                    contentClassName
                )}
            >
                <div className="max-h-72 overflow-y-auto p-1">
                    {options.length === 0 && (
                        <p className="py-2 text-center text-sm text-tertiary">No options available</p>
                    )}
                    {options.map((option) => (
                        <div
                            key={option.value}
                            role="checkbox"
                            tabIndex={option.disabled ? -1 : 0}
                            onClick={() => !option.disabled && toggleValue(option.value)}
                            onKeyDown={(event) => {
                                if (option.disabled) return
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    toggleValue(option.value)
                                }
                            }}
                            className={cn(
                                "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-sm text-secondary",
                                "hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-0",
                                "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                        >
                            <Checkbox
                                checked={selectedValues.includes(option.value)}
                                onCheckedChange={(next) => toggleValue(option.value, next === true)}
                                onClick={(event) => event.stopPropagation()}
                                aria-label={option.label}
                                size="sm"
                                className={cn("mt-0.5")}
                                disabled={option.disabled}
                            />
                            <span className="flex flex-col items-start text-left">
                                <span className="leading-tight">{option.label}</span>
                                {option.description && (
                                    <span className="text-xs text-tertiary leading-tight">{option.description}</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
})
MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
