"use client"

import { FormField } from "@/components/ui/Form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { FieldRow } from "./FieldRow"

type Option = { label: string; value: string }

type Props = {
    name: string
    label: string
    description?: string
    options: Option[]
    control: any
    className?: string
}


function SelectField({ name, label, description, options, control, className }: Props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FieldRow label={label} description={description} className={className}>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full sm:w-42">
                            <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent className="border-main/40" align="end">
                        {options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
            )}
        />
    )
}

export { SelectField }
