import { Metadata } from "next"

const TITLE = "Forge"
const DESCRIPTION = ""

export const siteConfig: Metadata = {
    title: "Forge - Building dashboards made easy",
    description: "Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go!",
    icons: { icon: "/icon.png" },
    applicationName: "Forge",
    creator: "mvriu5",
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        images: [
            {
                url: "/example_layout.png",
                width: 1904,
                height: 925,
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
        images: ["/example_layout.png"]
    },
    category: "",
    alternates: { canonical: "./" },
    keywords: ["Dashboard", "Widgets", "Next.js", "Forge", "SEO"],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
}