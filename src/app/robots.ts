import { MetadataRoute } from "next"

export default function Robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/privacy", "/terms"],
            disallow: "/dashboard/"
        },
        host:  "tryforge.io",
        sitemap: "https://tryforge.io/sitemap.xml"
    }
}