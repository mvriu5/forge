import {NextRequest, NextResponse} from "next/server"
import { auth } from "./lib/auth"
import { headers } from "next/headers"

const authRoutes = ["/signin", "/signup"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const isAuthRoute = authRoutes.includes(pathname)
    const isLanding = pathname === "/"

    const referer = request.headers.get("referer") ?? ""
    const cameFromDashboard = referer.includes("/dashboard")

    if (session && isLanding && !cameFromDashboard) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
    }

    if (!session) {
        if (isAuthRoute || isLanding) return NextResponse.next()
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/ph/:path*',
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ]
}
