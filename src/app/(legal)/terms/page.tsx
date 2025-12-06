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
                <p className="text-tertiary">Last Updated: December 06, 2025</p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">1. Scope</h2>
                <p>
                    These Terms &amp; Conditions (&quot;Terms&quot;) govern the use of the Forge service (&quot;Service&quot;). By
                    accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must stop
                    using the Service.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">2. Service Provider</h2>
                <p>
                    The Service is operated by the individual identified in the legal notice (&quot;Imprint&quot;) available on our
                    website. The information in the Imprint forms part of these Terms.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">3. Accounts &amp; Authentication</h2>
                <p>Authentication is performed exclusively through OAuth 2.0 with third-party providers such as Google or GitHub. This means:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        By signing in, you authorize us to retrieve basic information required to operate the Service.
                    </li>
                    <li>
                        You may revoke this authorization at any time through your OAuth provider&apos;s account settings.
                    </li>
                    <li>
                        You are responsible for securing your OAuth accounts and for all activities performed through them.
                    </li>
                    <li>
                        You must notify us immediately if you believe there has been unauthorized access to your account.
                    </li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">4. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Use the Service for unlawful purposes</li>
                    <li>Attempt to bypass security mechanisms</li>
                    <li>Interfere with or disrupt the Service or its infrastructure</li>
                    <li>Impersonate other persons or provide false information</li>
                </ul>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">5. Third-Party Integrations</h2>
                <p>
                    The Service may integrate with external services such as Google or GitHub. Use of these integrations is
                    additionally governed by the respective providers&apos; terms and privacy policies. We have no control over
                    third-party services and are not responsible for their availability or data processing.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">6. Intellectual Property</h2>
                <p>
                    Unless otherwise stated, the Service and all original content are our intellectual property. You may not copy,
                    reproduce, or reuse any component of the Service without prior written permission unless permitted by applicable
                    open-source licenses.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">7. Availability</h2>
                <p>
                    The Service is provided &quot;as is&quot; and without any guarantee of uninterrupted availability or error-free
                    operation. We may modify, suspend, or discontinue parts of the Service at any time.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">8. Liability</h2>
                <p>
                    (1) We are liable without limitation for intent and gross negligence.
                    <br />
                    (2) For cases of slight negligence, liability is limited to damages arising from the breach of essential
                    contractual obligations (material obligations).
                    <br />
                    (3) We are not liable for indirect, incidental, or consequential damages.
                    <br />
                    (4) Liability under mandatory statutory provisions (e.g., product liability laws) remains unaffected.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">9. Termination</h2>
                <p>
                    We may suspend or terminate your access to the Service at any time, without prior notice, if you violate these
                    Terms or otherwise misuse the Service.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">10. Changes to These Terms</h2>
                <p>
                    We may update or modify these Terms from time to time. Substantial changes will be announced in an appropriate
                    manner. Your continued use of the Service after updates constitutes acceptance of the revised Terms.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">11. Governing Law</h2>
                <p>
                    These Terms are governed by the laws of the Federal Republic of Germany, excluding its conflict-of-law rules.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">12. Contact</h2>
                <p>For questions regarding these Terms, please contact us at hello@tryforge.io.</p>
            </div>
        </div>
    )
}
