"use client"

import {AnimatePresence, motion} from "framer-motion"
import {Check, Clipboard, Share2} from "lucide-react"
import React, {HTMLAttributes, ReactNode, useEffect, useState} from "react"
import {Button} from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"
import {cn} from "@/lib/utils"

interface CopyButtonProps extends HTMLAttributes<HTMLDivElement> {
    copyText: string
    copyIcon?: ReactNode
    tooltip?: any
}

const CopyButton: React.FC<CopyButtonProps> = ({ copyText, tooltip, copyIcon, className, ...props }) => {
    const [isChecked, setIsChecked] = useState(false)
    const {addToast} = useToast()

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
                addToast({
                     title: "Successfully copied to clipboard",
                     icon: <Clipboard size={24} className={"text-brand"}/>,
                     classNames: {
                         motionClassname: "z-[100]",
                     }
                })
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
                        <Check size={16} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="clipboard"
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, y: '100%' }}
                        transition={{ duration: 0.2 }}
                    >
                        {copyIcon ? copyIcon : <Share2 size={16} /> }
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    )
}

export { CopyButton }