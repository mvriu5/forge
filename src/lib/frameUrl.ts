const isPrivateIpv4 = (hostname: string) => {
    const parts = hostname.split(".").map(Number)
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
        return false
    }

    const [first, second] = parts
    return (
        first === 0 ||
        first === 10 ||
        first === 127 ||
        first >= 224 ||
        (first === 100 && second >= 64 && second <= 127) ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168)
    )
}

const isPrivateIpv6 = (hostname: string) => {
    const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase()
    return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized)
}

export const isSafeFrameUrl = (value: string) => {
    try {
        const url = new URL(value)
        const hostname = url.hostname.toLowerCase()

        return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            Boolean(hostname) &&
            hostname !== "localhost" &&
            !hostname.endsWith(".localhost") &&
            !hostname.endsWith(".local") &&
            !isPrivateIpv4(hostname) &&
            !isPrivateIpv6(hostname)
        )
    } catch {
        return false
    }
}
