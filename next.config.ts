import type { NextConfig } from "next"
import { withPlausibleProxy } from "next-plausible"

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        qualities: [100, 75]
    },
    skipTrailingSlashRedirect: true,
}

export default withPlausibleProxy({
    src: "https://analytics.ahsmus.com/js/script.js",
})(nextConfig)
