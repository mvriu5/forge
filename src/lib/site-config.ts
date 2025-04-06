import { Metadata } from "next"

const TITLE = "Forge"
const DESCRIPTION = ""

export const siteConfig: Metadata = {
    title: "Forge",
    description: "Build your own dashboard",
    icons: {
        icon: "/favicon.ico",
    },
    applicationName: "Forge",
    creator: "mvriu5",
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_APP_URL}/api/og/home`,
                width: 1200,
                height: 630,
                alt: TITLE,
            },
        ],
    },
    twitter: {
        site: "@",
        creator: "@",
        card: "summary_large_image",
    },
    category: "",
    alternates: {
        canonical: process.env.NEXT_PUBLIC_APP_URL,
    },
    keywords: [
    ],
    //metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!)
}