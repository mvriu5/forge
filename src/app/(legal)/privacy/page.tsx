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
                <p className="text-tertiary">Last Updated: December 06, 2025</p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">1. Introduction</h2>
                <p>
                    This Privacy Policy explains how we handle your personal data when you use our services
                    (&quot;Service&quot;). We are committed to minimizing data collection and processing only what is strictly
                    necessary.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">2. Data Controller</h2>
                <p>
                    The Service is operated by the individual listed in the website&apos;s legal notice
                    (&quot;Imprint&quot;). This person is the responsible Data Controller according to the GDPR (Art. 4(7)
                    GDPR). You may contact us at: <strong>hello@tryforge.io</strong>.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">3. Data We Collect &amp; OAuth Authentication</h2>
                <p>We use OAuth 2.0 for all authentication processes. This means:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>
                        <strong>No Password Storage:</strong> We do not store or process your passwords. Authentication is
                        performed securely by external providers (e.g., Google, GitHub).
                    </li>
                    <li>
                        <strong>Minimal Data Storage:</strong> We store only the minimum information required to operate the
                        Service, such as a unique OAuth user identifier, your email address, and authentication tokens.
                    </li>
                    <li>
                        <strong>Provider Tokens:</strong> OAuth access tokens are stored securely and used only to maintain
                        authentication and access resources you explicitly authorize. We do not request or access data beyond the
                        granted OAuth scopes.
                    </li>
                </ul>
                <p className="mt-3">
                    To ensure technical operation and security, our hosting provider may automatically process certain information
                    in server logs, such as IP address, timestamp, browser/user-agent, requested URL, and referrer information.
                    These logs are used solely for operational and security purposes (Art. 6(1)(f) GDPR).
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">4. How We Use Your Information</h2>
                <p>We process your personal data only for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Authenticating your identity</li>
                    <li>Providing and improving the Service</li>
                    <li>Maintaining your account</li>
                    <li>Ensuring security and preventing misuse</li>
                    <li>Communicating with you if required for service-related matters</li>
                </ul>
                <p className="mt-3">
                    Processing is based on Art. 6(1)(b) GDPR (performance of a contract) and Art. 6(1)(f) GDPR (legitimate
                    interest in secure and stable operation).
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">5. Data Sharing</h2>
                <p>
                    We do not sell your data. Data is only shared with service providers necessary to operate the Service,
                    including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>OAuth providers (e.g., Google, GitHub)</li>
                    <li>Hosting and infrastructure providers</li>
                </ul>
                <p className="mt-3">
                    All processors are selected with care and process data only according to our instructions (Art. 28 GDPR).
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">6. International Data Transfers</h2>
                <p>
                    Some external providers (e.g., Google, GitHub) may be located in countries outside the EU/EEA, such as the
                    United States. When interacting with these providers, your data may be transferred to such countries.
                </p>
                <p className="mt-3">
                    Transfers occur under lawful mechanisms such as adequacy decisions (if applicable), Standard Contractual
                    Clauses (SCCs), or other provider-specific safeguards. You can find further details in the privacy policies of
                    each OAuth provider.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">7. Security</h2>
                <p>
                    We implement industry-standard technical and organizational measures to protect your data, including encrypted
                    transport (HTTPS), minimal data retention, no password storage, and secure token handling. While no system can
                    be completely secure, we continuously work to protect your information.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">8. Your Rights</h2>
                <p>Under the GDPR, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Right of access (Art. 15 GDPR)</li>
                    <li>Right to rectification (Art. 16 GDPR)</li>
                    <li>Right to erasure (Art. 17 GDPR)</li>
                    <li>Right to restriction of processing (Art. 18 GDPR)</li>
                    <li>Right to data portability (Art. 20 GDPR)</li>
                    <li>Right to object (Art. 21 GDPR)</li>
                </ul>
                <p className="mt-3">
                    You may also revoke OAuth permissions at any time via your account settings with the respective provider. If
                    you believe your data is processed unlawfully, you have the right to lodge a complaint with your local
                    supervisory authority.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">9. Data Retention</h2>
                <p>
                    We store your data only as long as necessary for providing the Service or as required by law. If you delete
                    your account or revoke OAuth permissions, associated data will be removed unless we are legally required to
                    keep it.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">10. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Material changes will be announced in an appropriate
                    manner, and the updated version will always be available on this page.
                </p>

                <h2 className="text-primary text-lg font-semibold mt-6 mb-3">11. Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at{" "}
                    <strong>hello@tryforge.io</strong>.
                </p>
            </div>
        </div>
    )
}
