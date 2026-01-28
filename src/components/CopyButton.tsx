"use client"

import { Button } from "@/components/ui/Button"
import { toast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy } from "lucide-react"
import React, { HTMLAttributes, ReactNode, useEffect, useState } from "react"

interface CopyButtonProps extends HTMLAttributes<HTMLDivElement> {
    copyText: string
    copyIcon?: ReactNode
    tooltip?: any
    size?: number
    strokeWidth?: number
}

const CopyButton: React.FC<CopyButtonProps> = ({ copyText, tooltip, copyIcon, size = 16, strokeWidth = 2.5, className, ...props }) => {
    const [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsChecked(false), 5000)
        return () => clearTimeout(timer)
    }, [isChecked])

    return (
        <Button
            {...tooltip}
            variant={"ghost"}
            className={cn("px-2 text-tertiary", className)}
            onClick={() => {
                setIsChecked(true)
                navigator.clipboard.writeText(copyText).then()
                toast.success("Successfully copied to clipboard.")
            }}
        >
            <AnimatePresence mode={"wait"}>
                {isChecked ? (
                    <motion.div
                        key="check"
                        initial={{ opacity: 0, scale: 0.4}}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, y: '100%'}}
                        transition={{ duration: 0.2 }}
                    >
                        <Check size={size} strokeWidth={strokeWidth} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="clipboard"
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, y: '100%' }}
                        transition={{ duration: 0.2 }}
                    >
                        {copyIcon ? copyIcon : <Copy size={size} strokeWidth={strokeWidth}/> }
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    )
}

export { CopyButton }
