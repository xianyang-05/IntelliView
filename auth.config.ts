import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    providers: [], // Configured in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/") &&
                !nextUrl.pathname.startsWith("/login") &&
                !nextUrl.pathname.startsWith("/signup") &&
                !nextUrl.pathname.startsWith("/register") &&
                !nextUrl.pathname.startsWith("/api") &&
                !nextUrl.pathname.startsWith("/_next") &&
                !nextUrl.pathname.startsWith("/images") &&
                !nextUrl.pathname.startsWith("/favicon.ico")

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false
            } else if (isLoggedIn) {
                if (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup") || nextUrl.pathname.startsWith("/register")) {
                    return Response.redirect(new URL("/", nextUrl))
                }
            }
            return true
        },
    },
} satisfies NextAuthConfig
