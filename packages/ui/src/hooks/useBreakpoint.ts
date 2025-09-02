"use client"

import { useState, useEffect } from "react"

type Breakpoint = "desktop" | "tablet" | "mobile"
type TailwindBreakpoint = "2xl" | "xl" | "lg" | "md" | "sm" | "xs"

export const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")
    const [tailwindBreakpoint, setTailwindBreakpoint] = useState<TailwindBreakpoint>("2xl")

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth

            if (width < 640) {
                setTailwindBreakpoint("sm")
                setBreakpoint("mobile")
            } else if (width < 768) {
                setTailwindBreakpoint("sm")
                setBreakpoint("mobile")
            } else if (width < 1024) {
                setTailwindBreakpoint("md")
                setBreakpoint("tablet")
            } else if (width < 1280) {
                setTailwindBreakpoint("lg")
                setBreakpoint("tablet")
            } else if (width < 1536) {
                setTailwindBreakpoint("xl")
                setBreakpoint("desktop")
            } else {
                setTailwindBreakpoint("2xl")
                setBreakpoint("desktop")
            }
        }

        updateBreakpoint()

        window.addEventListener("resize", updateBreakpoint)
        return () => window.removeEventListener("resize", updateBreakpoint)
    }, [])

    return {
        breakpoint,
        tailwindBreakpoint
    }
}
