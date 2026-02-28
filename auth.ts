import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"

// Demo accounts — matched by email+password from env vars
const DEMO_ACCOUNTS = [
    {
        email: process.env.DEMO_HR_EMAIL || "rachel.lim@zerohr.com",
        password: process.env.DEMO_HR_PASSWORD || "demo-hr-2024",
        id: "demo-hr-001",
        name: "Rachel Lim",
        role: "hr_admin",
        companyId: "zerohr-demo",
    },
    {
        email: process.env.DEMO_EMPLOYEE_EMAIL || "alex.chan@zerohr.com",
        password: process.env.DEMO_EMPLOYEE_PASSWORD || "demo-employee-2024",
        id: "demo-employee-001",
        name: "Alex Chan",
        role: "employee",
        companyId: "zerohr-demo",
    },
    {
        email: process.env.DEMO_CANDIDATE_EMAIL || "candidate@zerohr.com",
        password: process.env.DEMO_CANDIDATE_PASSWORD || "demo-candidate-2024",
        id: "demo-candidate-001",
        name: "Jordan Lee",
        role: "candidate",
        companyId: null,
    },
]

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    debug: true,
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = (credentials.email as string).toLowerCase().trim()
                const password = credentials.password as string

                // 1. Check demo accounts first (no Firebase needed)
                const demoUser = DEMO_ACCOUNTS.find(
                    (a) => a.email.toLowerCase() === email && a.password === password
                )
                if (demoUser) {
                    return {
                        id: demoUser.id,
                        name: demoUser.name,
                        email: demoUser.email,
                        role: demoUser.role,
                        companyId: demoUser.companyId,
                        image: "https://github.com/shadcn.png",
                    }
                }

                // 2. Try Firebase Auth for real users
                try {
                    const { getAdminDb } = await import("@/lib/firebase-admin")
                    const adminDb = await getAdminDb()

                    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                    if (!apiKey) throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY")

                    const res = await fetch(
                        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                                returnSecureToken: true,
                            }),
                        }
                    )

                    const data = await res.json()
                    if (data.error) {
                        console.error("Firebase Auth Error:", data.error.message)
                        return null
                    }

                    const uid = data.localId
                    const profileDoc = await adminDb.collection("users").doc(uid).get()

                    if (!profileDoc.exists) {
                        return {
                            id: uid,
                            name: data.displayName || email,
                            email: data.email,
                            role: "employee",
                            companyId: null,
                            image: "https://github.com/shadcn.png",
                        }
                    }

                    const profile = profileDoc.data()!
                    return {
                        id: uid,
                        name: profile.full_name,
                        email: profile.email,
                        role: profile.role,
                        companyId: profile.company_id || null,
                        image: "https://github.com/shadcn.png",
                    }
                } catch (error) {
                    console.error("Authorize Exception:", error)
                    return null
                }
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (token.role) {
                session.user.role = token.role as string
                session.user.companyId = token.companyId as string
                session.user.id = token.id as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.companyId = user.companyId
                token.id = user.id
            }
            return token
        }
    },
})
