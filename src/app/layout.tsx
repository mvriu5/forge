import type {Metadata} from "next"
import {Geist, Geist_Mono} from "next/font/google"
import "./globals.css"
import type {ReactNode} from "react"
import {siteConfig} from "@/lib/site-config"
import {Providers} from "@/components/Providers"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({variable: "--font-geist-sans", subsets: ["latin"]})
const geistMono = Geist_Mono({variable: "--font-geist-mono", subsets: ["latin"]})

export const metadata: Metadata = siteConfig

export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                />
                <title>Forge</title>
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Analytics />
                <SpeedInsights />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
