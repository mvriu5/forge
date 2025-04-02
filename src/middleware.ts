// biome-ignore lint/style/useImportType: <explanation>
import { NextRequest, NextResponse } from "next/server"
import {betterFetch} from "@better-fetch/fetch"
import type { Session } from "@/lib/auth"

const authRoutes = ["/signin", "/signup"]
const passwordRoutes = ["/reset", "/forgot"]
const landingRoute = "/"

export async function middleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname
    const isAuthRoute = authRoutes.includes(pathName)
    const isPasswordRoute = passwordRoutes.includes(pathName)
    const isLanding = pathName === landingRoute

    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
        baseURL: process.env.BETTER_AUTH_URL,
        headers: { cookie: request.headers.get("cookie") || "" }
    })

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