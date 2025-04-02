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
    url: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({url}) => {
    const currentYear = new Date().getFullYear()

    return (
        <Html>
            <Head />
            <Preview>Welcome to forge! Please verify your email address.</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-[40px]">
                    <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
                        <Heading className="text-[24px] font-bold text-gray-800 mb-[16px]">
                            Welcome to forge!
                        </Heading>

                        <Text className="text-[16px] text-gray-600 mb-[24px]">
                            We're excited to have you join us. To get started, please verify your email address by clicking the button below.
                        </Text>

                        <Section className="text-center mb-[32px]">
                            <Button
                                className="bg-[#ed6631] text-white font-bold py-[12px] px-[24px] rounded-md no-underline text-center box-border"
                                href={url}
                            >
                                Verify
                            </Button>
                        </Section>

                        <Text className="text-[16px] text-gray-600 mb-[24px]">
                            If the button above doesn't work, you can also verify your account by copying and pasting the following link into your browser:
                        </Text>

                        <Text className="text-[14px] text-[#ed6631] mb-[24px] break-all">
                            <Link href={url}>
                                {url}
                            </Link>
                        </Text>

                        <Text className="text-[16px] text-gray-600 mb-[12px]">
                            This verification link will expire in 24 hours.
                        </Text>

                        <Text className="text-[16px] text-gray-600 mb-[24px]">
                            If you didn't create an account, you can safely ignore this email.
                        </Text>

                        <Hr className="border-main/40 my-[24px]" />

                        <Text className="text-[14px] text-gray-500 mb-[8px]">
                            Need help? Contact our support team at <Link href="mailto:support@tryforge.io" className="text-[#ed6631]">support@tryforge.io</Link>
                        </Text>

                        <Text className="text-[12px] text-gray-400 m-0">
                            123 Example Street, City, Country
                        </Text>

                        <Text className="text-[12px] text-gray-400 m-0">
                            &copy; {currentYear} Forge. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
