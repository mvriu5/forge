import {useEffect, useState} from "react"

export function useHoverSupported(): boolean {
    const [hoverSupported, setHoverSupported] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
        setHoverSupported(mql.matches)

        const listener = (e: MediaQueryListEvent) => setHoverSupported(e.matches)
        mql.addEventListener('change', listener)

        return () => mql.removeEventListener('change', listener)
    }, [])

    return hoverSupported
}