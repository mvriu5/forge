import {NextRequest, NextResponse} from "next/server"
import {getSessionCookie} from "better-auth/cookies"

const authRoutes = ["/signin", "/signup"]
const passwordRoutes = ["/reset", "/forgot"]
const landingRoutes = ["/", "/sitemap.xml"]

export async function middleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname
    const isAuthRoute = authRoutes.includes(pathName)
    const isPasswordRoute = passwordRoutes.includes(pathName)
    const isLanding = landingRoutes.includes(pathName)

    const session = getSessionCookie(request)

    if (!session) {
        if (isAuthRoute || isPasswordRoute || isLanding) return NextResponse.next()
        return NextResponse.redirect(new URL("/signin", request.url))
    }

    if (isAuthRoute || isPasswordRoute || isLanding) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}