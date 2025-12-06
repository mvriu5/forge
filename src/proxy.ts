import {NextRequest, NextResponse} from "next/server"
import { auth } from "./lib/auth"
import { headers } from "next/headers"

const authRoutes = ["/signin", "/signup"]
const passwordRoutes = ["/reset", "/forgot"]
const landingRoutes = ["/", "/privacy", "/terms", "/imprint", "/sitemap.xml"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const isAuthRoute = authRoutes.includes(pathname)
    const isPasswordRoute = passwordRoutes.includes(pathname)
    const isLanding = landingRoutes.includes(pathname)

    const referer = request.headers.get("referer") ?? ""
    const cameFromDashboard = referer.includes("/dashboard")

    if (session && isLanding && !cameFromDashboard) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
    }

    if (!session) {
        if (isAuthRoute || isPasswordRoute || isLanding) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (session && (isAuthRoute || isPasswordRoute)) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}