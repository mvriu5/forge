"use client"

import {SignUpCard} from "@/components/SignUpCard"
import {useState} from "react"
import {SignInCard} from "@/components/SignInCard"

type SignState = "signin" | "signup" | "forgot"

export default function SignIn() {
    const [signState, setSignState] = useState<SignState>("signin")

    return (
        <div className={"h-screen w-full flex items-center justify-center"}>
            {signState === "signup" && <SignUpCard onSignIn={() => setSignState("signin")} />}
            {signState === "signin" && <SignInCard onSignUp={() => setSignState("signup")}  onForgotPassword={() => setSignState("forgot")} />}

        </div>
    )
}