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
                    const { supabaseAdmin } = await import("@/lib/supabase-admin")

                    // 1. Authenticate with Supabase Auth using admin client
                    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
                        email: credentials.email as string,
                        password: credentials.password as string,
                    })

                    if (authError || !authData.user) {
                        console.error("Auth Error:", authError?.message)
                        return null
                    }

                    // 2. Fetch User Profile from public.users
                    const { data: profile, error: profileError } = await supabaseAdmin
                        .from("users")
                        .select("*")
                        .eq("id", authData.user.id)
                        .single()

                    if (profileError || !profile) {
                        console.error("Profile Error:", profileError?.message)
                        // Still allow login even without profile - use auth data
                        return {
                            id: authData.user.id,
                            name: authData.user.user_metadata?.full_name || credentials.email as string,
                            email: authData.user.email,
                            role: "employee",
                            companyId: null,
                            image: "https://github.com/shadcn.png",
                        }
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
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const { supabaseAdmin } = await import("@/lib/supabase-admin")
                    const email = user.email

                    if (!email) return false

                    // Check if user exists in Supabase Auth
                    const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('email', email).single()

                    if (!existingUser) {
                        // Create user in Supabase Auth (if not exists)
                        // Note: ideally we use admin.createUser, but for OAuth we mainly ensure the public.user record exists
                        // The database trigger 'on_auth_user_created' usually handles public.users creation
                        // For Google Auth, if the user doesn't exist in Supabase Auth, we might need to create them or let Supabase handle it if using Supabase Auth UI.
                        // However, since we are using NextAuth as the IDP and just syncing to Supabase:

                        // We will check if we need to create a shadow record. 
                        // Actually, NextAuth handles the session. We just need to ensure our public.users table has the record.
                        // But public.users is usually populated by a trigger on auth.users defaults. 
                        // If we are bypassing Supabase Auth for Google (using NextAuth Google Provider), we might not have an auth.users record!
                        // This is a discrepancy. 

                        // User Request says: "Use supabaseAdmin.auth.admin.createUser to create the user... The database trigger... will handle creating the public.users"
                        // So we MUST create an auth.users record.

                        // Check via admin API
                        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
                        const authUser = authUsers?.users.find(u => u.email === email)

                        if (!authUser) {
                            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                                email: email,
                                email_confirm: true,
                                user_metadata: { full_name: user.name }
                            })

                            if (createError) {
                                console.error("Failed to create Supabase user", createError)
                                return false
                            }
                        }
                    }
                } catch (error) {
                    console.error("SignIn Callback Error:", error)
                    return false
                }
            }
            return true
        },
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
        async jwt({ token, user, account }) {
            if (user) { // Initial sign in
                // If Google Sign In, we need to fetch user role from DB
                if (account?.provider === "google") {
                    try {
                        const { supabaseAdmin } = await import("@/lib/supabase-admin")
                        // Wait a bit for the trigger to create public.users if it was just created
                        // Better approach: Poll or just fail gracefully if not found immediately (user might need to wait)
                        // For now, let's try to fetch.

                        const { data: profile } = await supabaseAdmin
                            .from("users")
                            .select("*")
                            .eq("email", user.email)
                            .single()

                        if (profile) {
                            token.role = profile.role
                            token.companyId = profile.company_id
                        }
                    } catch (error) {
                        console.error("JWT Callback Error:", error)
                    }
                } else {
                    // Credentials login already verified user and returned role/id
                    token.role = user.role
                    token.companyId = user.companyId
                }
            }
            return token
        }
    },
})
