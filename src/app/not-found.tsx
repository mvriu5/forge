"use client"

import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {Button} from "@/components/ui/Button"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex w-full items-center justify-center text-center bg-primary">
            <div className="flex-col items-center justify-center text-primary md:flex">
                <div className="relative">
                    <h1 className="select-none text-[150px] font-bold text-secondary">404</h1>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <AlertCircle className="h-20 w-20 text-secondary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
                    <p className="text-secondary">
                        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                <Button
                    variant="default"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
            </div>
        </div>
    )
}