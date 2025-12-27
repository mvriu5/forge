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
    Text,
    Tailwind,
} from '@react-email/components'

interface VerificationEmailProps {
    url: string
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({url}) => {
    const currentYear = new Date().getFullYear()

    return (
        <Html>
            <Head />
            <Preview>Welcome to forge! Please verify your email address.</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-10">
                    <Container className="bg-white rounded-md mx-auto p-5 max-w-xl">
                        <Heading className="text-2xl font-bold text-gray-800 mb-4">
                            Welcome to forge!
                        </Heading>

                        <Text className="text-base text-gray-600 mb-6">
                            We're excited to have you join us. To get started, please verify your email address by clicking the button below.
                        </Text>

                        <Section className="text-center mb-8">
                            <Button
                                className="bg-[#ed6631] text-white font-bold py-3 px-6 rounded-md no-underline text-center box-border"
                                href={url}
                            >
                                Verify
                            </Button>
                        </Section>

                        <Text className="text-base text-gray-600 mb-6">
                            If the button above doesn't work, you can also verify your account by copying and pasting the following link into your browser:
                        </Text>

                        <Text className="text-sm text-[#ed6631] mb-6 break-all">
                            <Link href={url}>
                                {url}
                            </Link>
                        </Text>

                        <Text className="text-base text-gray-600 mb-3">
                            This verification link will expire in 24 hours.
                        </Text>

                        <Text className="text-base text-gray-600 mb-6">
                            If you didn't create an account, you can safely ignore this email.
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
                            <Text className="text-sm text-[#ed6631]">
                                Imprint
                            </Text>
                        </Link>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
