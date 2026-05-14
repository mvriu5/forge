import type { NextConfig } from "next"
import { withPlausibleProxy } from "next-plausible"

const nextConfig: NextConfig = {
    reactCompiler: true,
    env: {
        NEXT_PUBLIC_NOTIFICATIONS_ENABLED: `${Boolean(
            process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        )}`,
    },
    images: {
        qualities: [100, 75]
    },
    skipTrailingSlashRedirect: true,
}

export default withPlausibleProxy({
    src: "https://analytics.ahsmus.com/js/script.js",
})(nextConfig)
