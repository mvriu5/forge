import type {Metadata} from "next"
import {Geist, Geist_Mono} from "next/font/google"
import "./globals.css"
import type {ReactNode} from "react"
import {siteConfig} from "@/lib/site-config"
import {Providers} from "@/components/Providers"

const geistSans = Geist({variable: "--font-geist-sans", subsets: ["latin"]})

const geistMono = Geist_Mono({variable: "--font-geist-mono", subsets: ["latin"]})

export const metadata: Metadata = siteConfig

export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
