"use client"

import { FormField } from "@/components/ui/Form"
import { Switch } from "@/components/ui/Switch"
import { FieldRow } from "./FieldRow"

type Props = {
    name: string
    label: string
    description?: string
    control: any
    className?: string
}

function SwitchField({ name, label, description, control, className }: Props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FieldRow label={label} description={description} className={className}>
                <Switch onCheckedChange={field.onChange} checked={field.value} />
                </FieldRow>
            )}
        />
    )
}

export { SwitchField }
