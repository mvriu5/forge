import {SpinnerDotted} from "spinners-react"
import React from "react"

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-screen h-screen">
            <SpinnerDotted size={56} thickness={160} speed={100} color="rgba(237, 102, 49, 1)" />
        </div>
    )
}