"use client"

import React, { useEffect } from "react"
import {Button} from "lunalabs-ui"

interface ErrorProps {
    error: Error
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {

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


                <div className="mt-2">
                    <Button
                        variant="default"
                        onClick={() => reset()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    )
}