type SitemapEntry = {
    url: string
    lastModified: string
    changeFrequency:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
    priority?: number
}

export default async function Sitemap(): Promise<SitemapEntry[]> {
    const baseUrl = "https://www.tryforge.io"

    const staticPages: SitemapEntry[] = [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: 1.0
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: 0.2
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: 0.2
        }
    ]

    return [...staticPages]
}