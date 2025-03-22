// biome-ignore lint/style/useImportType: <explanation>
import { NextRequest, NextResponse } from "next/server"
import {betterFetch} from "@better-fetch/fetch"
import type { Session } from "@/lib/auth"

const authRoutes = ["/signin"];
const passwordRoutes = ["/reset-password", "/forgot-password"];

export async function middleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname;
    const isAuthRoute = authRoutes.includes(pathName);
    const isPasswordRoute = passwordRoutes.includes(pathName);

    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: process.env.BETTER_AUTH_URL,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        },
    )

    console.log(session)

    if (!session) {
        if (isAuthRoute || isPasswordRoute) return NextResponse.next();
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (isAuthRoute || isPasswordRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};