import {cva, type VariantProps} from "class-variance-authority"
import type React from "react"
import {cn} from "@/lib/utils"

const calloutVariants = cva(
    "rounded-md p-2 text-sm leading-normal transition-colors",
    {
        variants: {
            variant: {
                default: "bg-inverted/5 text-secondary",
                brand: "bg-brand/20 dark:bg-brand/10 text-brand",
                success: "bg-success dark:bg-success/10 text-success",
                warning: "bg-warning/20 dark:bg-warning/10 text-warning",
                error: "bg-error/20 dark:bg-error/10 text-error",
                info: "bg-info/20 dark:bg-info/10 text-info",
            },
        },
        defaultVariants: {
            variant: "default",
        }
    }
)

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof calloutVariants> {}

const Callout = ({ variant, children, className, ...props}: CalloutProps) => {
    return (
        <div className={cn(calloutVariants({ variant }), className)} {...props}>
            {children}
        </div>
    )
}

export { Callout }