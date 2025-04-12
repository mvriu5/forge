import {cva, type VariantProps} from "class-variance-authority"
import type {ReactNode} from "react"
import type React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border space-x-1 px-2 text-xs font-medium " +
    "leading-normal transition-colors border",
    {
        variants: {
            variant: {
                default: "bg-inverted/5 border-main text-primary/80",
                brand: "bg-brand/30 border-brand/80 text-brand",
                success: "bg-success/40 border-success/80 text-success",
                warning: "bg-warning/40 border-warning/80 text-warning",
                error: "bg-error/40 border-error/80 text-error",
                info: "bg-info/40 border-info/80 text-info",
            },
            border: {
                default: "",
                none: "border-none"
            }
        },
        defaultVariants: {
            variant: "default",
            border: "default"
        }
    }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    title?: string
    icon?: ReactNode
}

const Badge: React.FC<BadgeProps> = ({title, icon, variant, border, children, className, ...props}) => {
    return (
        <div className={cn(badgeVariants({ variant, border }), className)}{...props}>
            {icon}
            <p>{title}</p>
        </div>
    )
}
Badge.displayName = "Badge"

export { Badge }