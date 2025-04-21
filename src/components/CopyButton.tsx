"use client"

import { AnimatePresence, motion } from "framer-motion"
import {Check, Clipboard, CloudAlert, Copy} from "lucide-react"
import React, { HTMLAttributes, useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import {useToast} from "@/components/ui/ToastProvider"

interface CopyButtonProps extends HTMLAttributes<HTMLDivElement> {
    copyText: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ copyText, className, ...props }) => {
    const [isChecked, setIsChecked] = useState(false)
    const {addToast} = useToast()

    useEffect(() => {
        const timer = setTimeout(() => setIsChecked(false), 5000)
        return () => clearTimeout(timer)
    }, [isChecked])

    return (
        <Button
            variant={"ghost"}
            className={"px-2 text-tertiary"}
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
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, y: '100%' }}
                        transition={{ duration: 0.2 }}
                    >
                        <Copy size={16} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    )
}

export { CopyButton }