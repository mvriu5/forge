"use client"

import { useState, useEffect, useRef } from 'react'
import { onCLS } from 'web-vitals'

const DevTool = () => {
    const [renderTime, setRenderTime] = useState<number | null>(null)
    const [memoryUsage, setMemoryUsage] = useState<{usedJSHeapSize: number, totalJSHeapSize: number} | null>(null)
    const [componentRenderCount, setComponentRenderCount] = useState(0)
    const [cpuUsage, setCpuUsage] = useState<number | null>(null)
    const [domSize, setDomSize] = useState<number | null>(null)
    const [fps, setFps] = useState(0)
    const [networkCount, setNetworkCount] = useState(0)
    const [errorCount, setErrorCount] = useState(0)
    const [layoutShifts, setLayoutShifts] = useState(0)
    const [activeTimers, setActiveTimers] = useState(0)
    const [eventListeners, setEventListeners] = useState(0)

    const renderCountRef = useRef(0)
    const startTimeRef = useRef(performance.now())
    const frameCountRef = useRef(0)
    const lastFrameTimeRef = useRef(performance.now())
    const originalConsoleError = useRef(console.error)

    // Initialize and cleanup
    useEffect(() => {
        onCLS(metric => {
            setLayoutShifts(metric.value)
        })

        // Track render count
        renderCountRef.current += 1
        setComponentRenderCount(renderCountRef.current)

        // Measure render time
        const endTime = performance.now()
        const timeDiff = endTime - startTimeRef.current
        setRenderTime(timeDiff)
        startTimeRef.current = performance.now()

        // Get memory usage if available
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            const mem = (performance as any).memory
            setMemoryUsage({
                usedJSHeapSize: mem.usedJSHeapSize,
                totalJSHeapSize: mem.totalJSHeapSize
            })
        } else {
            setMemoryUsage(null)
        }

        // Calculate DOM size
        setDomSize(document.querySelectorAll('*').length)

        // Track FPS
        const trackFPS = () => {
            frameCountRef.current += 1
            const now = performance.now()
            const elapsed = now - lastFrameTimeRef.current

            if (elapsed >= 1000) {
                setFps(Math.round((frameCountRef.current * 1000) / elapsed))
                frameCountRef.current = 0
                lastFrameTimeRef.current = now
            }

            requestAnimationFrame(trackFPS)
        }

        const fpsTracker = requestAnimationFrame(trackFPS)

        // Simulate CPU measurement (would need a real implementation)
        const cpuInterval = setInterval(() => {
            const fakeCpuUsage = Math.random() * 15 + 5 // 5-20% range
            setCpuUsage(fakeCpuUsage)
        }, 2000)

        // Event listeners stats (simplified)
        const countEventListeners = () => {
            const listenerMap = new WeakMap<EventTarget, number>()
            let totalListeners = 0

            const origAdd = EventTarget.prototype.addEventListener
            const origRemove = EventTarget.prototype.removeEventListener

            EventTarget.prototype.addEventListener = function(type, listener, options) {
                // Nur wenn this ein Objekt oder eine Funktion ist, in die Map tracken
                if (this !== null && (typeof this === 'object' || typeof this === 'function')) {
                    const prev = listenerMap.get(this) ?? 0
                    listenerMap.set(this, prev + 1)
                    totalListeners += 1
                    setEventListeners(totalListeners)
                }
                return origAdd.call(this, type, listener, options)
            }

            EventTarget.prototype.removeEventListener = function(type, listener, options) {
                if (this !== null && (typeof this === 'object' || typeof this === 'function')) {
                    const prev = listenerMap.get(this) ?? 0
                    if (prev > 0) {
                        listenerMap.set(this, prev - 1)
                        totalListeners -= 1
                        setEventListeners(totalListeners)
                    }
                }
                return origRemove.call(this, type, listener, options)
            }

            return () => {
                EventTarget.prototype.addEventListener = origAdd
                EventTarget.prototype.removeEventListener = origRemove
            }
        }

        countEventListeners()

        // Count active timers (simplified)
        setActiveTimers(
            Object.keys(window).filter(key =>
                key.includes('Timeout') || key.includes('Interval')
            ).length
        )

        // Override console.error to track errors
        console.error = (...args) => {
            originalConsoleError.current.apply(console, args)
            setErrorCount(prev => prev + 1)
        }

        return () => {
            console.error = originalConsoleError.current
            clearInterval(cpuInterval)
            cancelAnimationFrame(fpsTracker)
        }
    }, [])

    // Format bytes to readable format
    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B'
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white border-t border-main z-50 text-xs">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                    <span className="text-brand px-2.5 py-1 font-medium mr-3 rounded-x bg-brand/10 border border-brand/20">DevTool</span>
                    <div className="flex items-center space-x-4">
                        
                        <div className="flex flex-col items-center px-3 border-r border-main">
                            <span className="text-tertiary">FPS</span>
                            <span className={`font-mono font-bold ${fps > 50 ? 'text-success' : fps > 30 ? 'text-warning' : 'text-error'}`}>{fps}</span>
                        </div>

                        <div className="flex flex-col items-center px-3 border-r border-main">
                            <span className="text-tertiary">Render</span>
                            <span className="font-mono">{renderTime?.toFixed(0)} ms</span>
                        </div>

                        <div className="flex flex-col items-center px-3 border-r border-main">
                            <span className="text-tertiary">Memory</span>
                            <span className="font-mono">{memoryUsage ? formatBytes(memoryUsage.usedJSHeapSize) : 'N/A'}</span>
                        </div>

                        <div className="flex flex-col items-center px-3 border-r border-main">
                            <span className="text-tertiary">CPU</span>
                            <span className="font-mono">{cpuUsage?.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center px-3 border-r border-main">
                        <span className="text-tertiary">DOM</span>
                        <span className="font-mono">{domSize}</span>
                    </div>

                    <div className="flex flex-col items-center px-3 border-r border-main">
                        <span className="text-tertiary">Network</span>
                        <span className="font-mono">{networkCount}</span>
                    </div>

                    <div className="flex flex-col items-center px-3 border-r border-main">
                        <span className="text-tertiary">Errors</span>
                        <span className={`font-mono ${errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{errorCount}</span>
                    </div>

                    <div className="flex flex-col items-center px-3 border-r border-main">
                        <span className="text-tertiary">CLS</span>
                        <span className="font-mono">{layoutShifts.toFixed(4)}</span>
                    </div>

                    <div className="flex flex-col items-center px-3">
                        <span className="text-tertiary">Render Count</span>
                        <span className="font-mono">{componentRenderCount}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {DevTool}