import Link from "next/link"
import {ArrowLeft} from "lucide-react"

export default function Imprint() {
    return (
        <div className="dark max-w-3xl mx-auto px-4 py-8">
            <Link href="/" className="inline-flex items-center text-sm mb-6 hover:underline text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <h1 className="text-brand text-2xl font-bold mb-2">Privacy Policy</h1>

            <div className="max-w-none">
                <p className="text-tertiary">Last Updated: December 06, 2025</p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">Responsible Operator</h2>
                <p>
                    <strong>Name:</strong><br />
                    Marius Ahsmus
                </p>

                <p className="mt-3">
                    <strong>Address:</strong><br />
                    Straße des 18. Oktober 25<br />
                    04103 Leipzig<br />
                    Germany
                </p>

                <p className="mt-3">
                    <strong>Contact:</strong><br />
                    Email: hello@tryforge.io
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">
                    Responsible for Content (§ 55 (2) RStV)
                </h2>
                <p>
                    Marius Ahsmus<br />
                    Straße des 18. Oktober 25<br />
                    04103 Leipzig
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">Liability for Content</h2>
                <p>
                    According to § 7(1) TMG, we are responsible for our own content. However, under §§ 8–10 TMG,
                    we are not obligated to monitor transmitted or stored information from third parties or investigate
                    circumstances that indicate illegal activity.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">Liability for Links</h2>
                <p>
                    Our website may contain links to external third-party websites. We have no influence on the content
                    of these sites and assume no liability for them. The respective provider or operator is responsible
                    for linked content.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">Copyright</h2>
                <p>
                    All content on this website is protected under German copyright law. Reproduction, editing, or
                    distribution requires permission from the rights holder unless otherwise permitted by an applicable
                    open-source license.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">Dispute Resolution</h2>
                <p>
                    We are not willing or obliged to take part in dispute resolution proceedings before a consumer
                    arbitration board.
                </p>

            </div>
        </div>
    )
}