import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        qualities: [100, 75]
    },
    skipTrailingSlashRedirect: true,
}

export default nextConfig
