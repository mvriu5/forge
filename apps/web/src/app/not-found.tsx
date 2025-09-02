"use client"

import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {Button} from "@/components/ui/Button"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="h-screen w-full flex flex-col gap-4 items-center justify-center text-center bg-primary">
            <h1 className="select-none text-8xl font-bold text-brand">404</h1>
            <h2 className="text-2xl font-semibold tracking-tight text-primary">Page Not Found</h2>
            <p className="text-tertiary">
                Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <Button
                onClick={() => router.back()}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Go Back
            </Button>
        </div>
    )
}