"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex w-full h-screen items-center justify-center text-center bg-[#0d0d0d]">
            <div className="flex-col items-center justify-center text-[#ededed]">
                <div className="gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Page Not Found!</h2>
                    <p className="text-[#bdbdbd]">Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
                </div>

                <button
                    className={
                        "inline-flex items-center justify-center h-8 px-4 py-2 whitespace-nowrap transition-all rounded-md shadow-md " +
                        "test-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none " +
                        "[&_svg]:shrink-0 bg-transparent hover:bg-[#1c1c1c] text-[#bdbdbd] hover:text-primary border border-main/60"
                    }
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </button>
            </div>
        </div>
    )
}
