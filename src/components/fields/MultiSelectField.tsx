"use client"

import React from "react"
import { FormField } from "@/components/ui/Form"
import { MultiSelect } from "@/components/ui/MultiSelect"
import { FieldRow } from "./FieldRow"

type Option = { label: string; value: string }

type Props = {
    name: string
    label: string
    description?: string
    options: Option[]
    control: any
    placeholder?: string
    className?: string
}

function MultiSelectField({name, label, description, options, control, placeholder = "Select…", className}: Props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const value: string[] = Array.isArray(field.value) ? field.value : []

                const displayValue = `${value.length} ${value.length === 1 ? "selection" : "selections"}`

                return (
                <FieldRow label={label} description={description} className={className}>
                    <MultiSelect
                    options={options}
                    displayValue={displayValue}
                    value={value}
                    onValueChange={field.onChange}
                    placeholder={placeholder}
                    />
                </FieldRow>
                )
            }}
        />
    )
}

export { MultiSelectField }
