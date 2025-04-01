import type React from "react"

interface ForgotPasswordEmailProps {
    firstName: string;
}

export const ForgotPasswordEmail: React.FC<Readonly<ForgotPasswordEmailProps>> = ({firstName}) => {
    return (
        <div>
            <h1>Welcome, {firstName}!</h1>
        </div>
    )
}
