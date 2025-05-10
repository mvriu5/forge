import type React from "react"
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components"

interface ResetPasswordEmailProps {
    url: string;
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({url}) => {
    return (
        <Html>
            <Head />
            <Preview>Reset your password</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-[40px]">
                    <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
                        <Heading className="text-[24px] font-bold text-gray-800 mt-[0px] mb-[24px]">
                            Password Reset Request
                        </Heading>

                        <Text className="text-[16px] leading-[24px] text-gray-600 mb-[12px]">
                            Hello,
                        </Text>

                        <Text className="text-[16px] leading-[24px] text-gray-600 mb-[24px]">
                            We received a request to reset your password. Please click the button below to create a new password. This link will expire in 24 hours.
                        </Text>

                        <Section className="text-center mb-[32px]">
                            <Button
                                className="bg-[#ed6631] text-white font-bold py-[12px] px-[24px] rounded-md no-underline text-center box-border"
                                href={url}
                            >
                                Reset Password
                            </Button>
                        </Section>

                        <Text className="text-[16px] text-gray-600 mb-[24px]">
                            If the button above doesn't work, you can also reset your password by copying and pasting the following link into your browser:
                        </Text>

                        <Text className="text-[14px] text-[#ed6631] mb-[24px] break-all">
                            <Link href={url}>
                                {url}
                            </Link>
                        </Text>

                        <Text className="text-[16px] leading-[24px] text-gray-600 mb-[12px]">
                            If you didn't request a password reset, you can safely ignore this email.
                        </Text>

                        <Text className="text-[16px] leading-[24px] text-gray-600 mb-[24px]">
                            For security reasons, this password reset link will expire in 24 hours. If you need assistance, please contact our support team.
                        </Text>

                        <Text className="text-[14px] leading-[20px] text-gray-500 mb-[32px]">
                            Thanks,<br />
                            The Forge team
                        </Text>

                        <Section className="border-t border-main/40 pt-[24px]">
                            <Text className="text-[12px] leading-[16px] text-gray-400 m-0">
                                © {new Date().getFullYear()} Forge. All rights reserved.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
