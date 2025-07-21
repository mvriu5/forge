"use client"

import { useState, useEffect } from "react"

type Breakpoint = "desktop" | "tablet" | "mobile"

export const useBreakpoint = (): Breakpoint => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth
            if (width < 768) {
                setBreakpoint("mobile")
            } else if (width < 1280) {
                setBreakpoint("tablet")
            } else {
                setBreakpoint("desktop")
            }
        }

        updateBreakpoint()

        window.addEventListener("resize", updateBreakpoint)
        return () => window.removeEventListener("resize", updateBreakpoint)
    }, [])

    return breakpoint
}
