"use client"

import { Button } from "@/components/ui/Button"
import React, { useEffect } from "react"

interface ErrorProps {
    error: Error
    reset: () => void
}

export default function CustomError({ error, reset }: ErrorProps) {

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex w-full items-center justify-center text-center bg-primary">
            <div className="flex-col items-center justify-center text-primary">

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Something went wrong!</h2>
                    <p className="text-secondary">See the console for more information.</p>
                </div>

                <Button
                    variant="default"
                    className={"mt-2"}
                    onClick={() => reset()}
                >
                    Try Again
                </Button>
            </div>
        </div>
    )
}