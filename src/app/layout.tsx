import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"
import { Figtree, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"
import PlausibleProvider from "next-plausible"
import { Providers } from "@/components/Providers"

const figtreeSans = Figtree({variable: "--font-figtree", subsets: ["latin"]})
const geistMono = Geist_Mono({variable: "--font-geist-mono", subsets: ["latin"]})

export const metadata: Metadata = siteConfig

export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            {process.env.NODE_ENV === "development" && (
                <head>
                    <script
                        crossOrigin="anonymous"
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                    />
                    <title>Forge</title>
                </head>
            )}
            <body className={`${figtreeSans.variable} ${geistMono.variable} antialiased min-h-screen bg-primary`}>
                <PlausibleProvider>
                    <Providers>{children}</Providers>
                </PlausibleProvider>
            </body>
        </html>
    )
}
