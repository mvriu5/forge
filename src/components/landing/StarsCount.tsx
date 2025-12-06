import { cacheLife } from "next/cache"

export async function StarsCount() {
    "use cache"
    cacheLife("hours")

    const data = await fetch("https://api.github.com/repos/mvriu5/forge")
    const json = await data.json()
    const stars = json.stargazers_count

    return (
        <span>
            {stars >= 1000 ? `★ ${(stars / 1000).toFixed(1)}k` : `★ ${stars.toLocaleString()}`}
        </span>
    )
}