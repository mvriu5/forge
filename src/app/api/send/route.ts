import { Resend } from 'resend';
import {ForgotPasswordEmail} from "@/components/emails/ForgotPasswordEmail"
import type {ReactNode} from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: ['delivered@resend.dev'],
            subject: 'Hello world',
            react: ForgotPasswordEmail({ firstName: 'John' }) as ReactNode
        })

        if (error) {
            return Response.json({ error }, { status: 500 })
        }

        return Response.json(data)
    } catch (error) {
        return Response.json({ error }, { status: 500 })
    }
}