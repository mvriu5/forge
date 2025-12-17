import { MetadataRoute } from "next"

export default function Robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/privacy", "/terms", "/imprint"],
            disallow: ["/dashboard/", "/reference/", "/api/"]
        },
        host:  "www.tryforge.io",
        sitemap: "https://www.tryforge.io/sitemap.xml"
    }
}