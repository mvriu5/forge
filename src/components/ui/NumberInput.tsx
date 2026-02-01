"use client"

import * as React from "react"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/InputGroup"
import { cn } from "@/lib/utils"

type NumberInputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type"
> & {
  groupClassName?: string
  decrementLabel?: string
  incrementLabel?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      groupClassName,
      decrementLabel = "Decrease value",
      incrementLabel = "Increase value",
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const { min, max, value } = props

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [
      inputRef,
    ])

    const valueNumber =
      typeof value === "number" ? value : value !== undefined ? Number(value) : NaN
    const minNumber = min !== undefined ? Number(min) : undefined
    const maxNumber = max !== undefined ? Number(max) : undefined
    const disableDecrement =
      disabled ||
      (minNumber !== undefined && !Number.isNaN(valueNumber) && valueNumber <= minNumber)
    const disableIncrement =
      disabled ||
      (maxNumber !== undefined && !Number.isNaN(valueNumber) && valueNumber >= maxNumber)

    const handleStep = React.useCallback((direction: "up" | "down") => {
      const el = inputRef.current
      if (!el || el.disabled) return
      if (direction === "up") {
        el.stepUp()
      } else {
        el.stepDown()
      }
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }, [])

    return (
      <InputGroup className={groupClassName}>
        <InputGroupButton
          aria-label={decrementLabel}
          disabled={disableDecrement}
          className="border-r border-main/60"
          onClick={() => handleStep("down")}
        >
          -
        </InputGroupButton>
        <InputGroupInput
          ref={inputRef}
          type="number"
          disabled={disabled}
          className={cn("text-center", className)}
          {...props}
        />
        <InputGroupButton
          aria-label={incrementLabel}
          disabled={disableIncrement}
          className="border-l border-main/60"
          onClick={() => handleStep("up")}
        >
          +
        </InputGroupButton>
      </InputGroup>
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
