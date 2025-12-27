import type React from "react"
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components"

interface ResetPasswordEmailProps {
    url: string
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({url}) => {
    const currentYear = new Date().getFullYear()

    return (
        <Html>
            <Head />
            <Preview>Reset your password</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-10">
                    <Container className="bg-white rounded-md mx-auto p-5 max-w-xl">
                        <Heading className="text-2xl font-bold text-gray-800 mt-0 mb-6">
                            Password Reset Request
                        </Heading>

                        <Text className="text-base leading-6 text-gray-600 mb-3">
                            Hello,
                        </Text>

                        <Text className="text-base leading-6 text-gray-600 mb-6">
                            We received a request to reset your password. Please click the button below to create a new password. This link will expire in 24 hours.
                        </Text>

                        <Section className="text-center mb-8">
                            <Button
                                className="bg-[#ed6631] text-white font-bold py-3 px-6 rounded-md no-underline text-center box-border"
                                href={url}
                            >
                                Reset Password
                            </Button>
                        </Section>

                        <Text className="text-base text-gray-600 mb-6">
                            If the button above doesn't work, you can also reset your password by copying and pasting the following link into your browser:
                        </Text>

                        <Text className="text-sm text-[#ed6631] mb-6 break-all">
                            <Link href={url}>
                                {url}
                            </Link>
                        </Text>

                        <Text className="text-base leading-6 text-gray-600 mb-3">
                            If you didn't request a password reset, you can safely ignore this email.
                        </Text>

                        <Text className="text-base leading-6 text-gray-600 mb-6">
                            For security reasons, this password reset link will expire in 24 hours. If you need assistance, please contact our support team.
                        </Text>

                        <Hr className="border-main/40 my-6" />

                        <Text className="text-sm text-gray-500 m-0">
                            Need help? Contact our support team at <Link href="mailto:support@tryforge.io" className="text-[#ed6631]">support@tryforge.io</Link>
                        </Text>

                        <Text className="text-xs text-gray-400 mb-2">
                            &copy; {currentYear} Forge. All rights reserved.
                        </Text>


                        <Link
                            href={"https://tryforge.io/imprint"}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                        >
                            <Text className="text-xs text-[#ed6631]">
                                Imprint
                            </Text>
                        </Link>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
