import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
    debug: true,
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                try {
                    // 1. Authenticate with Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: credentials.email as string,
                        password: credentials.password as string,
                    })

                    if (authError || !authData.user) {
                        console.error("Auth Error:", authError?.message)
                        return null
                    }

                    // 2. Fetch User Profile from public.users
                    const { data: profile, error: profileError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", authData.user.id)
                        .single()

                    if (profileError || !profile) {
                        console.error("Profile Error:", profileError?.message)
                        return null
                    }

                    return {
                        id: profile.id,
                        name: profile.full_name,
                        email: profile.email,
                        role: profile.role,
                        companyId: profile.company_id,
                        image: "https://github.com/shadcn.png", // Default avatar
                    }
                } catch (error) {
                    console.error("Authorize Exception:", error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
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
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login/signup pages
                if (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup") || nextUrl.pathname.startsWith("/register")) {
                    return Response.redirect(new URL("/", nextUrl))
                }
            }
            return true
        },
        async session({ session, token }) {
            if (token.role) {
                session.user.role = token.role as string
                session.user.companyId = token.companyId as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.companyId = user.companyId
            }
            return token
        }
    },
})
