import { useEffect, useRef, useState } from "react"

type Size = { width: number; height: number } | null

interface Options {
    debounce?: number
    box?: "content-box" | "border-box" | "device-pixel-content-box"
}

export default function useResizeObserver<T extends Element = Element>(targetRef: React.RefObject<T | null>, options: Options = {}): Size {
    const { debounce = 50, box = "content-box" } = options

    const [size, setSize] = useState<Size>(null)

    const rafRef = useRef<number | null>(null)
    const timerRef = useRef<number | null>(null)
    const roRef = useRef<ResizeObserver | null>(null)

    useEffect(() => {
        const el = targetRef?.current
        if (!el) return

        const updateSize = (w: number, h: number) => {
            setSize(prev => {
                if (!prev) return { width: w, height: h }
                if (prev.width === w && prev.height === h) return prev
                return { width: w, height: h }
            })
        }

        const handleEntry = (entry: ResizeObserverEntry) => {
            let width = entry.contentRect?.width ?? 0
            let height = entry.contentRect?.height ?? 0

            if ((entry as any).contentBoxSize) {
                const s = (entry as any).contentBoxSize
                const boxSize = Array.isArray(s) ? s[0] : s
                if (boxSize) {
                    width = boxSize.inlineSize ?? width
                    height = boxSize.blockSize ?? height
                }
            }

            if (debounce > 0) {
                if (timerRef.current) window.clearTimeout(timerRef.current)
                timerRef.current = window.setTimeout(() => {
                    updateSize(Math.round(width), Math.round(height))
                    timerRef.current = null
                }, debounce)
            } else {
                if (rafRef.current) cancelAnimationFrame(rafRef.current)
                rafRef.current = requestAnimationFrame(() => {
                    updateSize(Math.round(width), Math.round(height))
                    rafRef.current = null
                })
            }
        }

        if (typeof window !== "undefined" && typeof (window as any).ResizeObserver !== "undefined") {
            roRef.current = new (window as any).ResizeObserver((entries: ResizeObserverEntry[]) => {
                for (const entry of entries) {
                    if (entry.target === el) handleEntry(entry)
                }
            })
            try {
                (roRef.current as any).observe(el, { box })
            } catch {
                roRef.current?.observe(el)
            }

            const rect = el.getBoundingClientRect()
            updateSize(Math.round(rect.width), Math.round(rect.height))
        } else {
            const recalc = () => {
                const rect = el.getBoundingClientRect()
                updateSize(Math.round(rect.width), Math.round(rect.height))
            }
            recalc()
            window.addEventListener("resize", recalc)
            return () => {
                window.removeEventListener("resize", recalc)
            }
        }

        return () => {
            if (roRef.current) {
                roRef.current.disconnect()
                roRef.current = null
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            if (timerRef.current) {
                window.clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [targetRef, debounce, box])

    return size
}
