"use client"

import {type HTMLAttributes, type ReactNode, useEffect, useRef, useState} from "react"
import {X} from "lucide-react"
import {AnimatePresence, motion} from "framer-motion"
import { cn } from "@/lib/utils"
import {Button} from "@/components/ui/Button"

type Position = "tr" | "tl" | "tc" | "br" | "bl" | "bc"

export const positionClasses = (position: Position) => {
    if (position === "tr") return "top-4 right-4"
    if (position === "tl") return "top-4 left-4"
    if (position === "tc") return "top-4 left-1/2"
    if (position === "br") return "bottom-4 right-4"
    if (position === "bl") return "bottom-4 left-4"
    if (position === "bc") return "bottom-4 left-1/2"
    return ""
}

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
    id: string
    title: string
    subtitle?: string
    icon?: ReactNode
    position?: Position
    scale?: number
    closeButton?: boolean
    actionButton?: boolean
    onAction?: () => void
    actionButtonText?: string
    duration?: number
    classNames?: {
        titleClassname?: string
        subtitleClassname?: string
        iconClassname?: string
        closeClassname?: string
        closeDivClassname?: string
        motionClassname?: string
        actionButtonClassname?: string
    }
}

const Toast = ({id, title, subtitle, icon, scale = 1, position = "br", closeButton, actionButton, onAction, actionButtonText, duration = 3000, classNames, className, removeToast, isPaused, ...props}: ToastProps & {removeToast: (id: string) => void, isPaused: boolean}) => {
    const [visible, setVisible] = useState(true)
    const [width, setWidth] = useState<number>(0)
    const [_, setHeight] = useState<number>(0)
    const toastRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const remainingTimeRef = useRef<number>(duration)

    useEffect(() => {
        if (toastRef.current) {
            setWidth(toastRef.current.offsetWidth)
            setHeight(toastRef.current.offsetHeight)
        }
    }, [])

    useEffect(() => {
        let startTime: number

        const tick = () => {
            if (!isPaused) {
                const now = Date.now()
                remainingTimeRef.current -= now - startTime
                startTime = now

                if (remainingTimeRef.current <= 0) {
                    setVisible(false)
                } else {
                    timeoutRef.current = setTimeout(tick, 100) // Check every 100ms
                }
            } else {
                timeoutRef.current = setTimeout(tick, 100)
            }
        }

        startTime = Date.now()
        timeoutRef.current = setTimeout(tick, 100)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [isPaused])

    const isTopPositioned = ["tr", "tl", "tc"].includes(position)

    const variants = {
        initial: { opacity: 0, y: isTopPositioned ? "-120%" : "120%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: isTopPositioned ? "-120%" : "120%" }
    }

    return (
        <AnimatePresence onExitComplete={() => removeToast(id)}>
            {visible && (
                <motion.div
                    key={id}
                    ref={toastRef}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants}
                    transition={{duration: 0.5,}}
                    className={cn("rounded-md", positionClasses(position), classNames?.motionClassname)}
                    style={{...(position === "tc" || position === "bc" ? { marginLeft: `-${(width * scale) / 2}px` } : {}),
                        transformOrigin: isTopPositioned ? "center top" : "center bottom"}}
                >
                    <div
                        className={cn(
                            "min-w-72 min-h-16 flex flex-row justify-between p-2 pl-4 rounded-md shadow-md " +
                            "bg-primary border border-main/40",
                            className
                        )}
                        style={{ transform: `scale(${scale})` }}
                        {...props}
                    >
                        <div className={cn("flex flex-row items-center space-x-2", closeButton && "mr-2")}>
                            {icon &&
                                <div className={cn("text-secondary", classNames?.iconClassname)}>
                                    {icon}
                                </div>
                            }
                            <div className={cn("flex flex-col max-w-60", icon && "ml-4", actionButton)}>
                                <span className={cn("text-sm font-medium text-nowrap truncate text-secondary", classNames?.titleClassname)}>
                                    {title}
                                </span>
                                {subtitle && subtitle.trim() !== "" && (
                                    <span className={cn("text-xs text-tertiary", classNames?.subtitleClassname)}>
                                        {subtitle}
                                    </span>
                                )}
                            </div>
                            {actionButton &&
                                <Button
                                    className={cn("py-1 px-2 rounded-md text-xs", classNames?.actionButtonClassname)}
                                    onClick={onAction}
                                    variant={"default"}
                                >
                                    {actionButtonText || "Undo"}
                                </Button>
                            }
                        </div>
                        {closeButton &&
                            <Button
                                className={cn("group w-6 h-6 rounded-md p-0.5", classNames?.closeDivClassname)}
                                onClick={() => setVisible(false)}
                                variant={"ghost"}
                            >
                                <X size={16} className={cn("text-tertiary group-hover:text-primary", classNames?.closeClassname)}/>
                            </Button>
                        }
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export {
    type ToastProps,
    type Position,
    Toast
}
