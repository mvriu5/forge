import {cva, type VariantProps} from "class-variance-authority"
import React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center h-8 px-4 py-2 whitespace-nowrap transition-colors rounded-md " +
    "test-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none " +
    "[&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-transparent hover:bg-inverted/10 text-secondary hover:text-primary border border-main/60",
                primary: "bg-inverted/80 hover:bg-inverted border border-main text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black",
                brand: "bg-brand/70 hover:bg-brand border border-brand/40 text-white/80 hover:text-white",
                error: "bg-error/70 hover:bg-error border border-error/40 text-white/80 hover:text-white",
                ghost: "bg-transparent hover:bg-inverted/10 text-secondary hover:text-primary",
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({asChild, variant, className, ...props}, ref) => {
    const ButtonComponent = asChild ? Slot : "button"

    return (
        <ButtonComponent
            className={cn(buttonVariants({ variant, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, type ButtonProps }
