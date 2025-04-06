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

export default async function sitemap(): Promise<SitemapEntry[]> {
    const baseUrl = "tryforge.io"

    const staticPages: SitemapEntry[] = [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${baseUrl}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: 0.8,
        }
    ]

    return [...staticPages]
}