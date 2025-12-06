import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Privacy() {
    return (
        <div className="dark max-w-3xl mx-auto px-4 py-8">
            <Link href="/public" className="inline-flex items-center text-sm mb-6 hover:underline text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <h1 className="text-brand text-2xl font-bold mb-2">Privacy Policy</h1>

            <div className="max-w-none">
                <p className="text-tertiary">Last Updated: May 10, 2025</p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">1. Introduction</h2>
                <p>
                    This Privacy Policy explains how we handle your information when you use our services. We prioritize your
                    privacy and minimize data collection.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">2. Authentication & Data Collection</h2>
                <p>We use OAuth 2.0 for all authentication processes. This means:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>No Password Storage:</strong> We never store your passwords. Authentication is handled securely
                        through third-party providers (Google, GitHub, etc.).
                    </li>
                    <li>
                        <strong>Minimal Data Storage:</strong> We store only the minimum information necessary to provide our
                        services, such as a unique identifier and email address.
                    </li>
                    <li>
                        <strong>Provider Tokens:</strong> We store authentication tokens to maintain your session and access
                        authorized resources, but we do not store or access your personal information from these providers beyond
                        what is explicitly authorized.
                    </li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
                <p>The limited information we collect is used only to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Authenticate your identity</li>
                    <li>Provide our services</li>
                    <li>Maintain your account</li>
                    <li>Communicate with you about our services</li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">4. Data Sharing</h2>
                <p>
                    We do not sell your data. We only share the minimal information necessary with service providers who help us
                    deliver our services.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">5. Security</h2>
                <p>
                    We implement industry-standard security measures to protect your information. By using OAuth 2.0, we enhance
                    security by eliminating password storage and minimizing data exposure.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">6. Your Rights</h2>
                <p>
                    You have the right to access, correct, or delete your information. You can revoke OAuth permissions at any
                    time through your account settings or by contacting us.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">7. Changes to This Policy</h2>
                <p>
                    We may update this policy occasionally. We will notify you of significant changes by updating the date at the
                    top of this policy.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">8. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at hello@tryforge.io.</p>
            </div>
        </div>
    )
}
