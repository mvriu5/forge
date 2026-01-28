import { Metadata } from "next"

const TITLE = "Forge — Dashboards for Fast, Focused Team Productivity"
const DESCRIPTION = "Forge is a personal productivity OS for building custom dashboards, organizing work, and tracking key metrics with fast drag-and-drop widgets."

export const siteConfig: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    icons: { icon: "/icon.png" },
    applicationName: "Forge",
    creator: "mvriu5",
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "/",
        siteName: "Forge",
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_APP_URL}/example_layout.png`,
                width: 2159,
                height: 1247,
                alt: TITLE,
            }
        ]
    },
    twitter: {
        site: "@tryforgeio",
        creator: "@tryforgeio",
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        images: [`${process.env.NEXT_PUBLIC_APP_URL}/example_layout.png`]
    },
    alternates: { canonical: "/" },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
}
