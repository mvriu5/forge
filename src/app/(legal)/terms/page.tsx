import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Terms() {
    return (
        <div className="dark max-w-3xl mx-auto px-4 py-8">
            <Link href="/public" className="inline-flex items-center text-sm mb-6 hover:underline text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>

            <h1 className="text-brand text-2xl font-bold mb-2">Terms of Service</h1>

            <div className="max-w-none">
                <p className="text-tertiary">Last Updated: May 10, 2025</p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">1. Acceptance</h2>
                <p>
                    By using our service, you agree to these Terms. If you disagree with any part, please do not use our service.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">2. Account & Authentication</h2>
                <p>We use OAuth 2.0 for all authentication. This means:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>You authorize us to access limited information from your OAuth provider</li>
                    <li>You can revoke this access at any time through your provider's settings</li>
                    <li>You are responsible for maintaining the security of your OAuth provider accounts</li>
                    <li>You must notify us immediately of any unauthorized access</li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">3. User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Use our service for any illegal purpose</li>
                    <li>Attempt to gain unauthorized access to any part of our service</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Impersonate others or provide false information</li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">4. Intellectual Property</h2>
                <p>
                    Our service and its original content remain our exclusive property. You may not duplicate, copy, or reuse any
                    portion of our service without express permission.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">5. Termination</h2>
                <p>
                    We may terminate or suspend your access immediately, without prior notice, for conduct that we believe
                    violates these Terms or is harmful to other users or us.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">6. Limitation of Liability</h2>
                <p>
                    We are not liable for any indirect, incidental, special, or consequential damages resulting from your use of
                    or inability to use our service.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">7. Changes to Terms</h2>
                <p>
                    We may modify these Terms at any time. We'll provide notice of significant changes. Your continued use of our
                    service constitutes acceptance of the updated Terms.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">8. Contact</h2>
                <p>For questions about these Terms, please contact us at hello@tryforge.io.</p>
            </div>
        </div>
    )
}
