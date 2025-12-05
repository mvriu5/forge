import Link from "next/link"
import {ArrowLeft} from "lucide-react"

export default function Imprint() {
    return (
        <div className="dark max-w-3xl mx-auto px-4 py-8">
            <Link href="/?allowLanding=true" className="inline-flex items-center text-sm mb-6 hover:underline text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>


        </div>
    )
}