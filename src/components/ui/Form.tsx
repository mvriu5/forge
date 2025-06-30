"use client"

import * as React from "react"
import {Slot, Label as LabelPrimitive} from "radix-ui"
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    FormProvider,
    useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/Input"
import {ComponentPropsWithRef, HTMLAttributes, InputHTMLAttributes, useId} from "react"

const Form = FormProvider

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({...props}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    )
}

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()

    const fieldState = getFieldState(fieldContext.name, formState)

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>")
    }

    const { id } = itemContext

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    }
}

type FormItemContextValue = {
    id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItem = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
    const id = useId()

    return (
        <FormItemContext.Provider value={{ id }}>
            <div className={cn("space-y-2", className)} {...props} />
        </FormItemContext.Provider>
    )
}

const FormLabel = ({ className, ...props }: ComponentPropsWithRef<typeof LabelPrimitive.Root>) => {
    const { formItemId } = useFormField()

    return (
        // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
        <label
            className={cn("text-sm text-tertiary", className)}
            htmlFor={formItemId}
            {...props}
        />
    )
}

const FormControl = ({ ...props }: ComponentPropsWithRef<typeof Slot.Root>) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
        <Slot.Root
            id={formItemId}
            aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
            aria-invalid={!!error}
            {...props}
        />
    )
}

const FormInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
        <Input
            id={formItemId}
            className={cn(
                error && "border-2 border-error focus-visible:ring-0 focus:border-error",
                className
            )}
            aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
            aria-invalid={!!error}
            {...props}
        />
    )
}

const FormDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
    const { formDescriptionId } = useFormField()

    return (
        <p
            id={formDescriptionId}
            className={cn("text-[0.8rem] text-secondary", className)}
            {...props}
        />
    )
}

const FormMessage = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children
    if (!body) return null

    return (
        <p
            id={formMessageId}
            className={cn("text-xs text-error", className)}
            {...props}
        >
            {body}
        </p>
    )
}

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormInput,
    FormDescription,
    FormMessage,
    FormField,
}
