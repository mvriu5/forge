import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    cacheComponents: true,
    reactCompiler: true,
    images: {
        qualities: [100, 75]
    },
    async rewrites() {
        return [
            {
                source: "/ingest/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/ingest/:path*",
                destination: "https://eu.i.posthog.com/:path*",
            },
        ]
    },
    skipTrailingSlashRedirect: true,
}

export default nextConfig
