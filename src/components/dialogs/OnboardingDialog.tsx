"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/Dialog"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Check, Grid2x2Plus, Plus, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { ForgeLogo } from "../svg/ForgeLogo"
import { Github, Google, Notion } from "../svg/Icons"
import { DotPattern } from "../svg/DotPattern"

interface OnboardingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete?: () => void
}

interface OnboardingStep {
    title: string
    description: string
    content: React.ReactNode
    animation: React.ReactNode
}

function IntegrationAnimation() {
    const integrations = [
        { icon: <Github height={32} width={32} />, name: "GitHub", delay: 0},
        {icon: <Google height={32} width={32} />, name: "Google", delay: 0.1},
        {icon: <Notion height={32} width={32} />, name: "Notion", delay: 0.2},
        {icon: <Plus size={16}/>, name: "& More", delay: 0.3}
    ]

    return (
        <div className={"relative w-full h-32 flex items-center justify-center gap-4"}>
            {integrations.map((integration, i) => (
                <motion.div
                    key={integration.name}
                    className={"flex flex-col items-center gap-2"}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4, delay: integration.delay}}
                >
                    <motion.div
                        className={cn("w-14 h-14 rounded-md border border-main/40 bg-secondary flex items-center justify-center text-secondary")}
                        animate={{y: [0, -3, 0]}}
                        transition={{duration: 2, repeat: Infinity, delay: i * 0.2}}
                    >
                        {integration.icon}
                    </motion.div>
                    <motion.span
                        className={cn("text-xs font-mono",)}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5 + integration.delay}}
                    >
                        {integration.name}
                    </motion.span>
                </motion.div>
            ))}
        </div>
    )
}

function DashboardAnimation() {
    return (
        <div className={"relative w-full h-32 flex items-center justify-center gap-3"}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={"flex flex-col items-center gap-2"}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4, delay: i * 0.15}}
                >
                    <motion.div
                        className={cn(
                            "w-20 h-16 rounded-md border border-main/40 bg-secondary flex items-center justify-center",
                            i === 1 && "ring-2 ring-brand/30 border-brand/40"
                        )}
                        whileHover={{scale: 1.05}}
                        animate={i === 1 ? {scale: [1, 1.02, 1]} : {}}
                        transition={{duration: 2, repeat: Infinity}}
                    >
                        <div className={"flex flex-col gap-1"}>
                            <div className={"w-12 h-1.5 rounded-full bg-tertiary"}/>
                            <div className={"w-8 h-1.5 rounded-full bg-tertiary"}/>
                            <div className={"w-10 h-1.5 rounded-full bg-tertiary"}/>
                        </div>
                    </motion.div>
                    <motion.div
                        className={cn(
                            "text-xs",
                            i === 1 ? "text-brand" : "text-tertiary"
                        )}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5 + i * 0.1}}
                    >
                        {["Work", "Personal", "Projects"][i]}
                    </motion.div>
                </motion.div>
            ))}
        </div>
    )
}

function WidgetAnimation() {
    const widgets = [
        {w: "w-15", h: "h-12", delay: 0},
        {w: "w-13", h: "h-12", delay: 0.1},
        {w: "w-17", h: "h-12", delay: 0.15},
        {w: "w-20", h: "h-13", delay: 0.2},
        {w: "w-27", h: "h-13", delay: 0.25},
    ]

    return (
        <div className={"relative w-full h-32 flex items-center justify-center"}>
            <div className={"relative w-54 h-32 rounded-md border border-main/40 bg-secondary p-2 overflow-hidden"}>
                <div className={"flex flex-wrap gap-2"}>
                    {widgets.map((widget, i) => (
                        <motion.div
                            key={i}
                            className={cn(
                                "rounded border border-main/40 bg-tertiary/20",
                                widget.w,
                                widget.h
                            )}
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3, delay: widget.delay}}
                        />
                    ))}
                </div>
                <motion.div
                    className={"absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-brand/10 border border-brand/20 text-brand text-xs"}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.5}}
                >
                    <motion.div
                        animate={{rotate: [0, 10, -10, 0]}}
                        transition={{duration: 0.5, delay: 0.8}}
                    >
                        <Grid2x2Plus size={12}/>
                    </motion.div>
                    <span>Add</span>
                </motion.div>
            </div>
        </div>
    )
}

function OnboardingDialog({open, onOpenChange, onComplete}: OnboardingDialogProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const steps: OnboardingStep[] = [
        {
            title: "Welcome to Forge",
            description: "Let's get you started with a quick tour",
            content: (
                <p>Forge is your personal productivity dashboard that helps you stay organized. <br/> Integrate with your favorite apps & tools.</p>
            ),
            animation: <IntegrationAnimation/>
        },
        {
            title: "Create Dashboards",
            description: "Organize your widgets into custom dashboards",
            content: (
                <p>Dashboards are the foundation of Forge. <br/> Create multiple dashboards to organize different aspects of your life.</p>
            ),
            animation: <DashboardAnimation/>
        },
        {
            title: "Add Widgets",
            description: "Customize your dashboard with powerful widgets",
            content: (
                <p>Widgets are the building blocks of your dashboard. Add widgets to display information that matters to you.</p>
            ),
            animation: <WidgetAnimation/>
        }
    ]

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = () => {
        setCurrentStep(0)
        onOpenChange(false)
        onComplete?.()
    }

    const currentStepData = steps[currentStep]
    const isLastStep = currentStep === steps.length - 1
    const isFirstStep = currentStep === 0

    return (
        <Dialog
            open={open}
            onOpenChange={(prev) => {
                if (!prev) setCurrentStep(0)
                onOpenChange(prev)
            }}
        >
            <DialogContent
                className={"md:min-w-130 max-w-[90vw] p-0"}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className={"flex flex-col gap-4 border-b border-main/40 p-4"}>
                    <div className={"flex items-center gap-3"}>
                        <ForgeLogo size={46} className="border border-main/40 p-1.5 rounded-md shadow-xs dark:shadow-md"/>
                        <div className={"flex flex-col"}>
                            <DialogTitle className={"text-lg font-semibold"}>
                                {currentStepData.title}
                            </DialogTitle>
                            <DialogDescription className={"text-xs text-tertiary"}>
                                {currentStepData.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className={"relative flex items-center px-4"}>
                    <DotPattern className="z-0 inset-0 absolute opacity-65 dark:opacity-25 -my-4 h-70"/>
                    <button
                        type={"button"}
                        onClick={handlePrevious}
                        disabled={isFirstStep}
                        className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md border border-main/40 bg-secondary flex items-center justify-center text-secondary hover:text-primary hover:bg-tertiary transition-all z-10",
                            isFirstStep && "opacity-0 pointer-events-none"
                        )}
                    >
                        <ArrowLeft size={16}/>
                    </button>

                    <div className={"flex flex-col gap-4 min-h-52 text-sm text-secondary w-full"}>
                        {currentStepData.content}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{opacity: 0, x: 20}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: -20}}
                                transition={{duration: 0.3}}
                            >
                                {currentStepData.animation}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button
                        type={"button"}
                        onClick={handleNext}
                        disabled={isLastStep}
                        className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md border border-main/40 bg-secondary flex items-center justify-center text-secondary hover:text-primary hover:bg-tertiary transition-all z-10",
                            isLastStep && "opacity-0 pointer-events-none"
                        )}
                    >
                        <ArrowRight size={16}/>
                    </button>
                </div>

                <div className="z-10 flex flex-col gap-4 p-4 border-t border-main/40 bg-tertiary">
                    <div className={"flex items-center justify-center gap-2"}>
                        {steps.map((_, index) => {
                            const isActive = index === currentStep
                            const isLastActive = isLastStep && isActive
                            return (
                                <motion.button
                                    key={index}
                                    type={"button"}
                                    onClick={() => isLastActive ? handleComplete() : setCurrentStep(index)}
                                    className={cn(
                                        "group rounded-full flex items-center justify-center transition-colors",
                                        isActive
                                            ? "bg-brand"
                                            : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20",
                                    )}
                                    animate={{
                                        width: isLastActive ? 72 : isActive ? 48 : 8,
                                        height: isLastActive ? 24 : 8
                                    }}
                                    transition={{duration: 0.3, ease: "easeOut"}}
                                >
                                    <AnimatePresence mode="wait">
                                        {isLastActive && (
                                            <motion.div
                                                initial={{opacity: 0, scale: 0}}
                                                animate={{opacity: 1, scale: 1}}
                                                exit={{opacity: 0, scale: 0}}
                                                transition={{duration: 0.2, delay: 0.1}}
                                            >
                                                <Check size={20} className="text-white"/>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default OnboardingDialog
