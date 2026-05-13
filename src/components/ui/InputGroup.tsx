"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-8 w-full min-w-0 items-center overflow-hidden rounded-md border border-main/60 bg-primary shadow-xs dark:shadow-md transition-colors outline-0 focus-within:border-brand focus-within:bg-brand/5 focus-within:outline focus-within:outline-brand/60 has-[input:disabled]:opacity-50 has-[input:disabled]:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "text-secondary hover:text-primary h-8 gap-2 text-sm shadow-none flex items-center justify-center rounded-none border-0 px-2",
  {
    variants: {
      size: {
        xs: "h-8 px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-7 p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-8 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-secondary shadow-none outline-0 ring-0 placeholder:text-tertiary focus-visible:ring-0 disabled:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
    InputGroup,
    InputGroupButton,
    InputGroupInput
}
