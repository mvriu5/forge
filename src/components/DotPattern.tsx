
"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, {useEffect, useId, useMemo, useRef, useState} from "react";
import { debounce } from 'lodash';

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    className?: string;
    glow?: boolean;
    [key: string]: unknown;
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 *
 * @component
 *
 * @see DotPatternProps for the props interface.
 *
 * @example
 * // Basic usage
 * <DotPattern />
 *
 * // With glowing effect and custom spacing
 * <DotPattern
 *   width={20}
 *   height={20}
 *   glow={true}
 *   className="opacity-50"
 * />
 *
 * @notes
 * - The component is client-side only ("use client")
 * - Automatically responds tno contaier size changes
 * - When glow is enabled, dots will animate with random delays and durations
 * - Uses Motion for animations
 * - Dots color can be controlled via the text color utility classes
 */

export function DotPattern({
                               width = 16,
                               height = 16,
                               className,
                               glow = false,
                               ...props
                           }: DotPatternProps) {
    const id = useId();
    const containerRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = debounce(() => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        }, 100);

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => {
            window.removeEventListener("resize", updateDimensions);
            updateDimensions.cancel();
        };
    }, []);

    const dots = useMemo(() => Array.from(
        {
            length:
                Math.ceil(dimensions.width / width) *
                Math.ceil(dimensions.height / height),
        },
        (_, i) => {
            const col = i % Math.ceil(dimensions.width / width);
            const row = Math.floor(i / Math.ceil(dimensions.width / width));
            return {
                x: col * width + 1,
                y: row * height + 1,
                delay: Math.random() * 5,
                duration: Math.random() * 3 + 2,
            };
        },
    ), [dimensions, width, height]);

    return (
        <svg
            ref={containerRef}
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full",
                className,
            )}
            {...props}
        >
            <defs>
                <radialGradient id={`${id}-gradient`}>
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
            </defs>
            {dots.map((dot) => (
                <motion.circle
                    key={`${dot.x}-${dot.y}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={1}
                    fill={glow ? `url(#${id}-gradient)` : "currentColor"}
                    opacity={0.3}
                    className="text-secondary"
                    initial={glow && { opacity: 0.4} }
                    animate={glow && {opacity: [0.4, 1, 0.4]}}
                    transition={glow ? {
                        duration: dot.duration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: dot.delay,
                        ease: "easeInOut"} : {}
                    }
                />
            ))}
        </svg>
    );
}
